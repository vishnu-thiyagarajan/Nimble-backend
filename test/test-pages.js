process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let Role = require("../models/role.model");

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let should = chai.should();

chai.use(chaiHttp);

describe("Roles", () => {
  //   beforeEach((done) => {
  //     //Before each test we empty the database
  //     Role.remove({}, (err) => {
  //       done();
  //     });
  //   });
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
