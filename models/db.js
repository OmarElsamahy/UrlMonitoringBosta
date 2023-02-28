const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  useremail: {
    type: String,
    unique: true,
    required: true,
  },
  userpassword: {
    type: String,
    required: true,
  },
  userconfirmation: {
    type: Boolean,
    default: false,
  },
});

const userValidation = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    useremail: Joi.string().email().required(),
    userpassword: Joi.string().min(8).max(50).required(),
  });
  return schema.validate(user);
};

const checkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    url: {
      type: String,
      required: true,
    },

    protocol: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["HTTP", "HTTPS", "TCP"],
      default: "HTTP",
    },

    path: {
      type: String,
    },

    port: {
      type: Number,
    },

    webhook: {
      type: String,
    },

    timeout: {
      type: Number,
      default: 5,
    },

    interval: {
      type: Number,
      default: 10,
    },

    threshold: {
      type: Number,
      default: 1,
    },

    authentication: {
      username: {
        type: String,
      },
      password: {
        type: String,
      },
    },

    httpHeaders: [
      {
        key: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],

    assert: {
      statusCode: {
        type: Number,
      },
    },

    ignoreSSL: {
      type: Boolean,
      required: true,
    },

    tags: {
      type: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const urlValidation = (link) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    url: Joi.string().min(5).required(),
    protocol: Joi.string().valid("HTTP", "HTTPS", "TCP").required().uppercase(),
    path: Joi.string(),
    port: Joi.number(),
    webhook: Joi.string(),
    timeout: Joi.number(),
    interval: Joi.number(),
    threshold: Joi.number(),
    ignoreSSL: Joi.bool().required(),
    tags: Joi.string(),
  });

  return schema.validate(link);
};

const monitorSchema = new mongoose.Schema({
  checkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Check",
    required: true,
  },
  status: {
    type: String,
    enum: ["up", "down"],
    default: "up",
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  upTime: {
    type: Number,
    default: 0,
  },
  downTime: {
    type: Number,
    default: 0,
  },
  endTime: {
    type: Date,
    default: null,
  },
  responseTime: {
    type: Number,
    default: null,
  },
  history: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["up", "down"],
      },
      responseTime: {
        type: Number,
        default: null,
      },
    },
  ],
  tag: {
    type: String,
    default: null,
  },
});

const Monitor = mongoose.model("Monitor", monitorSchema);
const User = mongoose.model("User", userSchema);
const Check = mongoose.model("Check", checkSchema);

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(process.env.URL, connectionParams)
  .then(() => {
    console.log("Connected to the database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });

// Exporting our model objects
module.exports = {
  User,
  Check,
  Monitor,
  urlValidation,
  userValidation,
};
