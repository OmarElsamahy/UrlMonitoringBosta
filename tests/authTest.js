const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const { Check, User, Monitor } = require("../models/db");
chai.use(chaiHttp);
chai.should();

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const expect = chai.expect;

chai.use(chaiHttp);

describe("User Signup", () => {
  beforeEach((done) => {
    // clear users from the database before each test
    User.deleteMany({}, (err) => {
      done();
    });
  });

  afterEach((done) => {
    // clear users from the database after each test
    User.deleteMany({}, (err) => {
      done();
    });
  });

  it("should create a new user", (done) => {
    chai
      .request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("User created successfully");
        expect(res.body.user).to.have.property("_id");
        expect(res.body.user).to.have.property("name").to.equal("Test User");
        expect(res.body.user)
          .to.have.property("email")
          .to.equal("test@example.com");
        done();
      });
  });

  it("should return an error if name is not provided", (done) => {
    chai
      .request(app)
      .post("/api/auth/signup")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Name is required");
        done();
      });
  });

  it("should return an error if email is not provided", (done) => {
    chai
      .request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        password: "password123",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Email is required");
        done();
      });
  });

  it("should return an error if password is not provided", (done) => {
    chai
      .request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test@example.com",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Password is required");
        done();
      });
  });

  it("should return an error if email is already in use", (done) => {
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    user.save((err, user) => {
      chai
        .request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Email is already in use");
          done();
        });
    });
  });
});

describe("Authentication", () => {
  describe("POST /signin", () => {
    it("should return a token on successful signin", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/signup")
        .send({ email: "omarelsamahy109@gmail.com", password: "0100name" });

      expect(res.status).to.equal(200);
      expect(res.body.token).to.be.a("string");
    });

    it("should return a 401 error if user credentials are invalid", async () => {
      const res = await chai.request(app).post("/api/auth/signup").send({
        email: "invaliduser@example.com",
        password: "invalidpassword",
      });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Invalid email or password");
    });
  });
});
