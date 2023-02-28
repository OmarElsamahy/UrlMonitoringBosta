const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/authController.js");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 */

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                type: string
   *               useremail:
   *                 type: string
   *               userpassword:
   *                 type: string
   *             required:
   *               - name
   *               - useremail
   *               - userpassword
   *     responses:
   *       200:
   *         description: User registered successfully
   *       400:
   *         description: Invalid request body or email already taken
   *       500:
   *         description: Internal server error
   */
  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateEmail],
    controller.signup
  );

  /**
   * @swagger
   * /api/auth/confirmation/{token}:
   *   get:
   *     summary: Confirm user's email address
   *     tags: [Authentication]
   *     parameters:
   *       - in: path
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Token received in email confirmation message
   *     responses:
   *       200:
   *         description: Email confirmed successfully
   *       401:
   *         description: Invalid or expired token
   *       500:
   *         description: Internal server error
   */
  app.get("/api/auth/confirmation/:token", controller.emailconfirmation);

  /**
   * @swagger
   * /api/auth/signin:
   *   post:
   *     summary: Authenticate a user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               useremail:
   *                 type: string
   *               userpassword:
   *                 type: string
   *             required:
   *               - useremail
   *               - userpassword
   *     responses:
   *       200:
   *         description: User authenticated successfully
   *       400:
   *         description: Invalid request body or incorrect email/password
   *       500:
   *         description: Internal server error
   */
  app.post("/api/auth/signin", controller.signin);
};
