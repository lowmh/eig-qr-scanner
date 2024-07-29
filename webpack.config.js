const path = require("path");

module.exports = {
  // other webpack configurations...
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: [path.resolve(__dirname, "node_modules/html5-qrcode")],
      },
    ],
  },
};
