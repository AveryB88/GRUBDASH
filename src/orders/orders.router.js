// TODO: Implement the /orders routes needed to make the tests pass
const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// create, read, update, delete, and list

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router
    .route("/:orderId")
    .get(controller.read)
    .delete(controller.delete)
    .put(controller.update)
    .all(methodNotAllowed);



module.exports = router;