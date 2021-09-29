process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let Role = require("../src/models/role.model");
let User = require("../src/models/user.model");
let chai = require("chai");
let deepEqualInAnyOrder = require("deep-equal-in-any-order");
let chaiHttp = require("chai-http");
let server = require("../src/server");

let should = chai.should();
const { expect } = chai;

chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

describe("Roles", () => {
  describe("/GET allroles", () => {
    it("it should GET all the Roles", (done) => {
      chai
        .request(server)
        .get("/api/allroles")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });
});

describe("Users", () => {
  beforeEach((done) => {
    User.deleteOne({ email: "pestonimble@gmail.com" }, (err) => {
      done();
    });
  });
  describe("/POST register", () => {
    let body = {
      name: "pesto",
      email: "pestonimble@gmail.com",
      password: "password",
      role: {
        _id: "614a20f86376b7cfe31d5f2d",
        name: "Scrum Master",
      },
    };
    it("it should register the user", (done) => {
      chai
        .request(server)
        .post("/api/register")
        .send(body)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          expect(res.body).to.deep.equalInAnyOrder({
            message: "Please activate your account from your email",
          });
          User.findOneAndUpdate({ email: res.body.email }, { active: true });
          done();
        });
    });

    // it("it should login the user", (done) => {
    //   chai
    //     .request(server)
    //     .post("/api/login")
    //     .send(body)
    //     .end((err, res) => {
    //       res.should.have.status(200);
    //       res.body.should.be.a("object");
    //       expect(res.body).to.deep.equalInAnyOrder();
    //       done();
    //     });
    // });
  });

  // describe("/POST activate", () => {
  //   let body = {
  //     token:
  //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJwZXN0byIsImVtYWlsIjoicGVzdG9uaW1ibGVAZ21haWwuY29tIiwicm9sZSI6IjYxNGEyMGY4NjM3NmI3Y2ZlMzFkNWYyZCJ9LCJpYXQiOjE2MzI4NTY4NDN9.Ngjt6Sr4_l_35dvAENCVl6I13Gk2QNb2fcu2ORp2hQs",
  //   };
  //   it("it should activate the user", (done) => {
  //     chai
  //       .request(server)
  //       .put("/api/activate")
  //       .send(body)
  //       .end((err, res) => {
  //         console.log(res.body);
  //         res.should.have.status(200);
  //         res.body.should.be.a("object");
  //         // expect(res.body).to.deep.equalInAnyOrder({
  //         //   message: "Please activate your account from your email",
  //         // });
  //         done();
  //       });
  //   });
  // });
});
