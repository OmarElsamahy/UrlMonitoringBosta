const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const { Check, User, Monitor } = require("../models/db");
chai.use(chaiHttp);
chai.should();

describe("addCheck endpoint", () => {
  let token = null;

  before((done) => {
    chai
      .request(server)
      .post("/api/test/signin")
      .send({
        useremail: "omarelsamahy109@gmail.com",
        userpassword: "0100name",
      })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });
  it("should add a new check", (done) => {
    chai
      .request(app)
      .post("/api/test/addCheck")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Example Check",
        url: "https://www.example.com",
        protocol: "https",
        port: 443,
        path: "/",
        webhook: "https://www.example.com/webhook",
        timeout: 5,
        interval: 10,
        threshold: 1,
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("name").eql("Example Check");
        res.body.should.have.property("url").eql("https://www.example.com");
        res.body.should.have.property("protocol").eql("https");
        res.body.should.have.property("port").eql(443);
        res.body.should.have.property("path").eql("/");
        res.body.should.have
          .property("webhook")
          .eql("https://www.example.com/webhook");
        res.body.should.have.property("timeout").eql(5);
        res.body.should.have.property("interval").eql(10);
        res.body.should.have.property("threshold").eql(1);
        done();
      });
  });

  it("should return an error if name is not provided", (done) => {
    chai
      .request(app)
      .post("/api/test/addCheck")
      .set("Authorization", `Bearer ${token}`)
      .send({
        url: "https://www.example.com",
        protocol: "https",
        port: 443,
        path: "/",
        webhook: "https://www.example.com/webhook",
        timeout: 5,
        interval: 10,
        threshold: 1,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Name is required");
        done();
      });
  });

  it("should return an error if url is not provided", (done) => {
    chai
      .request(app)
      .post("/api/test/addCheck")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Example Check",
        protocol: "https",
        port: 443,
        path: "/",
        webhook: "https://www.example.com/webhook",
        timeout: 5,
        interval: 10,
        threshold: 1,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("URL is required");
        done();
      });
  });
});

const expect = chai.expect;

describe("updateCheck route", () => {
  let checkId;

  before(async () => {
    // Create a check for testing
    const newCheck = new Check({
      name: "Test check",
      url: "https://example.com",
      protocol: "https",
      path: "/",
      port: 443,
      timeout: 5,
      interval: 10,
      threshold: 3,
      authentication: "",
      httpHeaders: "",
      assert: "",
      ignoreSSL: true,
      createdBy: "testuser",
    });
    const savedCheck = await newCheck.save();
    checkId = savedCheck._id;
  });

  after(async () => {
    // Remove the test check from the database
    await Check.deleteOne({ _id: checkId });
  });

  it("should update the check with valid data", (done) => {
    chai
      .request(app)
      .put(`/api/test/updateCheck?id=${checkId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated check",
        url: "https://updated.com",
        protocol: "https",
        path: "/updated",
        port: 443,
        timeout: 10,
        interval: 15,
        threshold: 5,
        authentication: "",
        httpHeaders: "",
        assert: "",
        ignoreSSL: true,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.check).to.have.property("name", "Updated check");
        expect(res.body.check).to.have.property("url", "https://updated.com");
        expect(res.body.check).to.have.property("path", "/updated");
        expect(res.body.check).to.have.property("timeout", 10);
        expect(res.body.check).to.have.property("interval", 15);
        expect(res.body.check).to.have.property("threshold", 5);
        expect(res.body.check).to.have.property("ignoreSSL", true);
        done();
      });
  });

  it("should return a 404 error if the check id does not exist", (done) => {
    chai
      .request(app)
      .put(`/api/test/updateCheck?id=nonexistent`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated check",
        url: "https://updated.com",
        protocol: "https",
        path: "/updated",
        port: 443,
        timeout: 10,
        interval: 15,
        threshold: 5,
        authentication: "",
        httpHeaders: "",
        assert: "",
        ignoreSSL: true,
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error", "Check not found");
        done();
      });
  });
});

describe("DELETE /api/test/deleteCheck", () => {
  let token;
  let checkId;

  before((done) => {
    // perform signin to get token
    chai
      .request(app)
      .post("/api/test/signin")
      .send({
        useremail: "omarelsamahy109@gmail.com",
        userpassword: "0100name",
      })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  beforeEach(async () => {
    // create a check for testing
    const response = await chai
      .request(app)
      .post("/api/test/addCheck")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Check",
        url: "https://www.example.com",
        protocol: "https",
        path: "/",
        port: 443,
        timeout: 5,
        interval: 10,
        threshold: 2,
      });
    checkId = response.body.check._id;
  });

  afterEach(async () => {
    // delete the check created for testing
    await chai
      .request(app)
      .delete(`/api/test/deleteCheck?id=${checkId}`)
      .set("Authorization", `Bearer ${token}`);
  });

  it("should delete the check", async () => {
    const response = await chai
      .request(app)
      .delete(`/api/test/deleteCheck?id=${checkId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property("message", "Succesfully deleted");
  });

  it("should return 404 if check not found", async () => {
    const response = await chai
      .request(app)
      .delete(`/api/test/deleteCheck?id=nonexistent`)
      .set("Authorization", `Bearer ${token}`);

    expect(response).to.have.status(404);
    expect(response.body).to.have.property("message", "Check Not Found");
  });
});

describe("Report API", () => {
  let token;
  let checkId;

  before((done) => {
    // Login to get auth token and create a new check to use in test
    chai
      .request(app)
      .post("/api/auth/signin")
      .send({
        useremail: "omarelsamahy109@gmail.com",
        userpassword: "0100name",
      })
      .end((err, res) => {
        token = res.body.token;

        // Create a new check
        chai
          .request(app)
          .post("/api/test/addCheck")
          .set("Authorization", `Bearer ${token}`)
          .send({ url: "http://www.google.com", protocol: "HTTP" })
          .end((err, res) => {
            checkId = res.body.check._id;
            done();
          });
      });
  });

  after(async () => {
    // Remove the check created in before hook
    await chai
      .request(app)
      .delete(`/api/test/deleteCheck?id=${checkId}`)
      .set("Authorization", `Bearer ${token}`);
  });

  describe("GET /api/test/getReportById", () => {
    it("should return a report for a valid check ID", (done) => {
      chai
        .request(app)
        .get(`/api/test/getReportById?id=${checkId}`)
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("report");
          expect(res.body.report).to.have.property("status");
          expect(res.body.report).to.have.property("availability");
          expect(res.body.report).to.have.property("outages");
          expect(res.body.report).to.have.property("downTime");
          expect(res.body.report).to.have.property("upTime");
          expect(res.body.report).to.have.property("avgResponseTime");
          expect(res.body.report).to.have.property("history");
          done();
        });
    });

    it("should return an error for an invalid check ID", (done) => {
      chai
        .request(app)
        .get("/api/test/getReportById?id=invalidid")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property(
            "message",
            " Error in Getting Report"
          );
          done();
        });
    });
  });
});

describe("Reports by tag", () => {
  let user, token;

  before(async () => {
    // create user and sign in to get token
    const signInRes = await chai
      .request(app)
      .post("/api/auth/signin")
      .send({ email: "omarelsamahy109@gmail.com", password: "0100name" });
    token = signInRes.body.token;

    // create check with monitor
    const check = await Check.create({
      name: "Test Check",
      url: "http://example.com",
      userId: user._id,
    });
    const monitor = await Monitor.create({
      checkId: check._id,
      tag: "testTag",
      status: "up",
      upTime: 1000,
      downTime: 0,
      outages: 0,
      history: [
        {
          timestamp: new Date(),
          status: "up",
          responseTime: 100,
        },
      ],
    });
  });

  after(async () => {
    // delete user and associated data
    await User.findByIdAndDelete(user._id);
    await Check.deleteMany({ userId: user._id });
    await Monitor.deleteMany({ checkId: { $in: user.checks } });
  });

  it("should get reports for monitors with matching tag", async () => {
    const res = await chai
      .request(app)
      .get("/api/test/getReportByTag")
      .set("Authorization", `Bearer ${token}`)
      .query({ tag: "testTag" });

    expect(res).to.have.status(200);
    expect(res.body.reports).to.be.an("array").that.has.lengthOf(1);
    expect(res.body.reports[0]).to.have.property("status").that.equals("up");
    expect(res.body.reports[0])
      .to.have.property("availability")
      .that.equals("100.00");
    expect(res.body.reports[0]).to.have.property("outages").that.equals(0);
    expect(res.body.reports[0]).to.have.property("downTime").that.equals(0);
    expect(res.body.reports[0]).to.have.property("upTime").that.equals(1000);
    expect(res.body.reports[0])
      .to.have.property("avgResponseTime")
      .that.equals(100);
    expect(res.body.reports[0]).to.have.property("history").that.is.an("array");
  });

  it("should return an error if no monitors found with matching tag", async () => {
    const res = await chai
      .request(app)
      .get("/api/reports/tag")
      .set("Authorization", `Bearer ${token}`)
      .query({ tag: "nonExistentTag" });

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal(" Error in Getting Reports");
  });
});
