"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _findIndex = _interopRequireDefault(require("@dword-design/functions/dist/find-index"));

var _omit = _interopRequireDefault(require("@dword-design/functions/dist/omit"));

var _some = _interopRequireDefault(require("@dword-design/functions/dist/some"));

var _express = _interopRequireDefault(require("express"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _nuxtPushPlugins = _interopRequireDefault(require("nuxt-push-plugins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(moduleOptions) {
  var _options$message;

  const options = { ...this.options.mail,
    ...moduleOptions
  };

  if (!options.smtp) {
    throw new Error('SMTP config is missing.');
  }

  if (Array.isArray(options.message) && options.message.length === 0 || !options.message) {
    throw new Error('You have to provide at least one config.');
  }

  if (!Array.isArray(options.message)) {
    options.message = [options.message];
  }

  if (_options$message = options.message, (0, _some.default)(c => !c.to && !c.cc && !c.bcc)(_options$message)) {
    throw new Error('You have to provide to/cc/bcc in all configs.');
  }

  const app = (0, _express.default)();

  const transport = _nodemailer.default.createTransport(options.smtp);

  app.use(_express.default.json(options.json || {}));
  app.post('/send', async (req, res) => {
    req.body = {
      config: 0,
      ...req.body
    };

    try {
      var _req$body, _options$message$req$;

      if (typeof req.body.config === 'string') {
        var _options$message2;

        const configIndex = (_options$message2 = options.message, (0, _findIndex.default)(_ => _.name === req.body.config)(_options$message2));

        if (configIndex === -1) {
          throw new Error(`Message config with name '${req.body.config}' not found.`);
        }

        req.body.config = configIndex;
      } else if (!options.message[req.body.config]) {
        throw new Error(`Message config not found at index ${req.body.config}.`);
      }

      await transport.sendMail({ ...(_req$body = req.body, (0, _omit.default)(['config', 'to', 'cc', 'bcc'])(_req$body)),
        ...(_options$message$req$ = options.message[req.body.config], (0, _omit.default)(['name'])(_options$message$req$))
      });
    } catch (error) {
      return res.status(400).send(error.message);
    }

    return res.sendStatus(200);
  });
  this.addServerMiddleware({
    handler: app,
    path: '/mail'
  });
  (0, _nuxtPushPlugins.default)(this, require.resolve("./plugin"));
}

module.exports = exports.default;