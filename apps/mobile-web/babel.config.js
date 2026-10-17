module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // Web paketi klasik script olarak yüklenir; zustand'ın ESM derlemesindeki `import.meta`
          // Expo'nun import.meta kayıt defterine çevrilmezse uygulama açılışta çöker.
          unstable_transformImportMeta: true,
        },
      ],
      'nativewind/babel',
    ],
  };
};
