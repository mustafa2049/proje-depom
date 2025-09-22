import math
import random
from dataclasses import dataclass
from typing import Tuple

import pygame

WIDTH, HEIGHT = 960, 600
FIELD_MARGIN = 40
GOAL_WIDTH = 160
PLAYER_RADIUS = 20
BALL_RADIUS = 12
PLAYER_SPEED = 260
AI_SPEED = 220
BALL_FRICTION = 0.98
KICK_STRENGTH = 420
FPS = 60

GREEN = (34, 139, 34)
DARK_GREEN = (30, 120, 30)
WHITE = (255, 255, 255)
BLACK = (15, 15, 15)
BLUE = (70, 130, 180)
RED = (200, 60, 60)
YELLOW = (240, 230, 140)

@dataclass
class Circle:
    position: pygame.Vector2
    velocity: pygame.Vector2
    radius: int
    color: Tuple[int, int, int]

    def move(self, dt: float) -> None:
        self.position += self.velocity * dt

    def draw(self, surface: pygame.Surface) -> None:
        pygame.draw.circle(surface, self.color, self.position, self.radius)

    def clamp(self) -> None:
        self.position.x = max(FIELD_MARGIN + self.radius, min(WIDTH - FIELD_MARGIN - self.radius, self.position.x))
        self.position.y = max(FIELD_MARGIN + self.radius, min(HEIGHT - FIELD_MARGIN - self.radius, self.position.y))


def create_player(color: Tuple[int, int, int], x: float) -> Circle:
    return Circle(pygame.Vector2(x, HEIGHT / 2), pygame.Vector2(0, 0), PLAYER_RADIUS, color)


def create_ball() -> Circle:
    return Circle(pygame.Vector2(WIDTH / 2, HEIGHT / 2), pygame.Vector2(0, 0), BALL_RADIUS, YELLOW)


def reset_positions(player: Circle, ai: Circle, ball: Circle, direction: int) -> None:
    player.position.update(WIDTH * 0.25, HEIGHT / 2)
    ai.position.update(WIDTH * 0.75, HEIGHT / 2)
    player.velocity.update(0, 0)
    ai.velocity.update(0, 0)
    ball.position.update(WIDTH / 2, HEIGHT / 2)
    angle = random.uniform(-0.3, 0.3)
    ball.velocity.update(direction * 180 * math.cos(angle), 180 * math.sin(angle))


def handle_input(player: Circle, dt: float) -> None:
    keys = pygame.key.get_pressed()
    direction = pygame.Vector2(0, 0)

    if keys[pygame.K_w] or keys[pygame.K_UP]:
        direction.y -= 1
    if keys[pygame.K_s] or keys[pygame.K_DOWN]:
        direction.y += 1
    if keys[pygame.K_a] or keys[pygame.K_LEFT]:
        direction.x -= 1
    if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
        direction.x += 1

    if direction.length_squared() > 0:
        direction = direction.normalize()
        player.velocity = direction * PLAYER_SPEED
    else:
        player.velocity.update(0, 0)


def update_ai(ai: Circle, ball: Circle, dt: float) -> None:
    target = ball.position
    direction = target - ai.position
    if direction.length_squared() > 0:
        direction = direction.normalize()
        ai.velocity = direction * AI_SPEED
    else:
        ai.velocity.update(0, 0)


def apply_velocity(circle: Circle, dt: float) -> None:
    circle.move(dt)
    circle.clamp()


def circle_collision(a: Circle, b: Circle) -> bool:
    return a.position.distance_squared_to(b.position) <= (a.radius + b.radius) ** 2


def resolve_collision(mover: Circle, target: Circle) -> None:
    delta = target.position - mover.position
    distance = delta.length()
    if distance == 0:
        return
    overlap = mover.radius + target.radius - distance
    if overlap > 0:
        push_dir = delta.normalize()
        mover.position -= push_dir * overlap / 2
        target.position += push_dir * overlap / 2
        relative_velocity = target.velocity - mover.velocity
        impulse = push_dir * relative_velocity.dot(push_dir)
        mover.velocity += impulse
        target.velocity -= impulse


def kick_ball(player: Circle, ball: Circle) -> None:
    keys = pygame.key.get_pressed()
    if keys[pygame.K_SPACE] and circle_collision(player, ball):
        direction = (ball.position - player.position)
        if direction.length_squared() > 0:
            ball.velocity = direction.normalize() * KICK_STRENGTH


def update_ball(ball: Circle, dt: float) -> None:
    ball.move(dt)
    if ball.position.y <= FIELD_MARGIN + BALL_RADIUS or ball.position.y >= HEIGHT - FIELD_MARGIN - BALL_RADIUS:
        ball.position.y = max(FIELD_MARGIN + BALL_RADIUS, min(HEIGHT - FIELD_MARGIN - BALL_RADIUS, ball.position.y))
        ball.velocity.y *= -1
    ball.velocity *= BALL_FRICTION


def draw_field(surface: pygame.Surface) -> None:
    surface.fill(DARK_GREEN)
    field_rect = pygame.Rect(FIELD_MARGIN, FIELD_MARGIN, WIDTH - FIELD_MARGIN * 2, HEIGHT - FIELD_MARGIN * 2)
    pygame.draw.rect(surface, GREEN, field_rect)
    pygame.draw.rect(surface, WHITE, field_rect, 4)
    pygame.draw.line(surface, WHITE, (WIDTH / 2, FIELD_MARGIN), (WIDTH / 2, HEIGHT - FIELD_MARGIN), 4)
    pygame.draw.circle(surface, WHITE, (WIDTH // 2, HEIGHT // 2), 70, 4)

    goal_height = 160
    top = HEIGHT / 2 - goal_height / 2
    bottom = HEIGHT / 2 + goal_height / 2

    pygame.draw.rect(surface, WHITE, (FIELD_MARGIN - 8, top, 8, goal_height))
    pygame.draw.rect(surface, WHITE, (WIDTH - FIELD_MARGIN, top, 8, goal_height))


def draw_ui(surface: pygame.Surface, font: pygame.font.Font, scores: Tuple[int, int]) -> None:
    text = font.render(f"Oyuncu {scores[0]} - {scores[1]} Yapay Zeka", True, WHITE)
    surface.blit(text, (WIDTH / 2 - text.get_width() / 2, 8))
    instructions = font.render("WASD veya oklar: hareket | SPACE: şut", True, WHITE)
    surface.blit(instructions, (WIDTH / 2 - instructions.get_width() / 2, HEIGHT - 32))


def check_goal(ball: Circle) -> int:
    goal_top = HEIGHT / 2 - 80
    goal_bottom = HEIGHT / 2 + 80
    if goal_top <= ball.position.y <= goal_bottom:
        if ball.position.x < FIELD_MARGIN:
            return 1
        if ball.position.x > WIDTH - FIELD_MARGIN:
            return -1
    return 0


def main() -> None:
    pygame.init()
    pygame.display.set_caption("2D Futbol")
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("arial", 24)

    player = create_player(BLUE, WIDTH * 0.25)
    ai = create_player(RED, WIDTH * 0.75)
    ball = create_ball()
    scores = [0, 0]
    serving_direction = random.choice([-1, 1])
    reset_positions(player, ai, ball, serving_direction)

    running = True
    while running:
        dt = clock.tick(FPS) / 1000
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        handle_input(player, dt)
        update_ai(ai, ball, dt)

        apply_velocity(player, dt)
        apply_velocity(ai, dt)
        resolve_collision(player, ai)

        kick_ball(player, ball)

        if circle_collision(player, ball):
            offset = ball.position - player.position
            if offset.length_squared() > 0:
                ball.position = player.position + offset.normalize() * (player.radius + ball.radius)

        if circle_collision(ai, ball):
            direction = (ball.position - ai.position)
            if direction.length_squared() > 0:
                ball.velocity = direction.normalize() * (KICK_STRENGTH * 0.7)
                ball.position = ai.position + direction.normalize() * (ai.radius + ball.radius)

        update_ball(ball, dt)
        ball.position.x = max(FIELD_MARGIN + BALL_RADIUS, min(WIDTH - FIELD_MARGIN - BALL_RADIUS, ball.position.x))

        goal = check_goal(ball)
        if goal != 0:
            scores[0 if goal > 0 else 1] += 1
            serving_direction = -goal
            reset_positions(player, ai, ball, serving_direction)

        draw_field(screen)
        player.draw(screen)
        ai.draw(screen)
        pygame.draw.circle(screen, BLACK, ball.position, ball.radius + 2)
        ball.draw(screen)
        draw_ui(screen, font, tuple(scores))
        pygame.display.flip()

    pygame.quit()


if __name__ == "__main__":
    main()
