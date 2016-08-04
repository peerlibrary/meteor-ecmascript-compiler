Plugin.registerCompiler({
  extensions: ['js'],
}, function () {
  return new BabelCompiler({
    runtime: false
  });
});
