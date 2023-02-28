const { authJwt } = require("../middlewares");
const controller = require("../controllers/userController.js");

/**
 * @swagger
 * tags:
 *   name: Checks
 *   description: Endpoints for creating, updating, and deleting checks, and getting reports
 *
 * /api/test/addCheck:
 *   post:
 *     summary: Create a new check
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               protocol:
 *                 type: string
 *               port:
 *                 type: integer
 *               path:
 *                 type: string
 *               webhook:
 *                 type: string
 *               timeout:
 *                 type: integer
 *               interval:
 *                 type: integer
 *               threshold:
 *                 type: integer
 *               authentication:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       '200':
 *         description: Check created successfully
 *       '400':
 *         description: Error in creating check
 *
 * /api/test/updateCheck:
 *   put:
 *     summary: Update an existing check
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               protocol:
 *                 type: string
 *               port:
 *                 type: integer
 *               path:
 *                 type: string
 *               webhook:
 *                 type: string
 *               timeout:
 *                 type: integer
 *               interval:
 *                 type: integer
 *               threshold:
 *                 type: integer
 *               authentication:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       '200':
 *         description: Check updated successfully
 *       '400':
 *         description: Error in updating check
 *
 * /api/test/deleteCheck:
 *   delete:
 *     summary: Delete an existing check
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID of the check to be deleted
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Check deleted successfully
 *       '400':
 *         description: Error in deleting check
 *
 * /api/test/getReportById:
 *   get:
 *     summary: Get report for a specific check by ID
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID of the check for which to get the report
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Report retrieved successfully
 *       '400':
 *         description: Error in getting report
 * /api/test/getReportByTag:
 *   get:
 *     summary: Get report for a specific check by Tag
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: tag
 *         in: query
 *         description: tag of the checks for which to get the reports
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Reports retrieved successfully
 *       '400':
 *         description: Error in getting reports
 * */

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.post("/api/test/addCheck", [authJwt.verifyToken], controller.createCheck);

  app.put(
    "/api/test/updateCheck",
    [authJwt.verifyToken],
    controller.updateCheck
  );

  app.delete(
    "/api/test/deleteCheck",
    [authJwt.verifyToken],
    controller.deleteCheck
  );

  app.get(
    "/api/test/getReportById",
    [authJwt.verifyToken],
    controller.getReportById
  );

  app.get(
    "/api/test/getReportByTag",
    [authJwt.verifyToken],
    controller.getReportByTag
  );
};
