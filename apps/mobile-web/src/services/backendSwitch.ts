import type { Endpoints } from './endpoints';

/**
 * Her erişimde `select()` ile seçilen uç noktalara yönlendiren vekil.
 * Böylece store'lar `api.decks.list()` çağırmaya devam eder; sunucu/yerel mod çalışma anında değişebilir.
 */
export function createBackendSwitch(select: () => Endpoints): Endpoints {
  return new Proxy({} as Endpoints, {
    get(_target, group) {
      return select()[group as keyof Endpoints];
    },
  });
}
