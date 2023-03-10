const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId)
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`
    })
}

function statusMissing(req, res, next) {
    const { data: { status } = {} } = req.body
    status ? next() : next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
}

function statusEmpty(req, res, next) {
    const { data: { status } = {} } = req.body
    status != '' ? next() : next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
}

function statusInvalid(req, res, next) {
    const { data: { status } = {} } = req.body
    status === 'pending' ||
        status === 'preparing' ||
        status === 'out-for-delivery' ?
        next() :
        next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
}


function bodyHasDeliverToProperty(req, res, next) {
    const { data: { deliverTo } = {} } = req.body
    deliverTo ? next() : next({ status: 400, message: 'Order must include a deliverTo' })
}

function bodyHasMobileNumberProperty(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body
    mobileNumber ? next() : next({ status: 400, message: 'Order must include a mobileNumber' })
}

function bodyHasDishesProperty(req, res, next) {
    const { data: { dishes } = {} } = req.body
    dishes ? next() : next({ status: 400, message: 'Order must include a dish' })
}

function dishesPropertyIsAnArray(req, res, next) {
    const { data: { dishes } = {} } = req.body
    Array.isArray(dishes) ? next() : next({ status: 400, message: 'Order must include at least one dish' })
}

function dishesArrayIsNotEmpty(req, res, next) {
    const { data: { dishes } = {} } = req.body
    dishes.length > 0 ? next() : next({ status: 400, message: 'Order must include at least one dish' })
}

function dishesArrayHasDishQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => !dish.quantity)
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` }) : next()
}

function dishQuantityIsAnInteger(req, res, next) {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity))
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` }) : next()
}

function dishQuantityIsGreaterThanZero(req, res, next) {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => dish.quantity <= 0)
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` }) : next()
}

function dataIdDoesNotMatchOrderId(req, res, next) {
    const { data: { id } = {} } = req.body
    const order = res.locals.order
    if (!id || id === '' || id === null || id === undefined) {
        return next()
    }
    id === order.id ? next() : next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${order.id}` })
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newOrderId = nextId()
    const newOrder = {
        id: newOrderId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

function read(req, res) {
    const order = res.locals.order
    res.json({ data: order })
}

function update(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const order = res.locals.order
    const updatedOrder = {
        id: order.id,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    res.json({ data: updatedOrder })
}

function destroy(req, res, next) {
    const order = res.locals.order
    const { orderId } = req.params
    const index = orders.findIndex((order) => order.id === orderId)
    if (index > -1 && order.status === 'pending') {
        orders.splice(index, 1)
    } else {
        return next({
            status: 400,
            message: 'An order cannot be deleted unless it is pending'
        })
    }
    res.sendStatus(204)
}

function list(req, res) {
    res.json({ data: orders })
}

module.exports = {
    create: [
        bodyHasDeliverToProperty,
        bodyHasMobileNumberProperty,
        bodyHasDishesProperty,
        dishesPropertyIsAnArray,
        dishesArrayIsNotEmpty,
        dishesArrayHasDishQuantity,
        dishQuantityIsGreaterThanZero,
        dishQuantityIsAnInteger,
        create],
    read: [orderExists, read],
    update: [
        orderExists,
        bodyHasDeliverToProperty,
        bodyHasMobileNumberProperty,
        bodyHasDishesProperty,
        dishesPropertyIsAnArray,
        dishesArrayIsNotEmpty,
        dishesArrayHasDishQuantity,
        dishQuantityIsGreaterThanZero,
        dishQuantityIsAnInteger,
        statusMissing,
        statusEmpty,
        statusInvalid,
        dataIdDoesNotMatchOrderId,
        update],
    delete: [orderExists, destroy],
    list
}
