import {
  createCategorySchema,
  createEventSchema,
  updateEventSchema,
} from "../validators/event.validator.js";

import {
  cancelEvent,
  createCategory,
  createEvent,
  getCategories,
  getPublishedEventById,
  getPublishedEvents,
  updateEvent,
} from "../services/event.service.js";

function formatValidationError(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export async function listEvents(req, res) {
  try {
    const { search, categoryId } = req.query;

    const events = await getPublishedEvents({
      search,
      categoryId,
    });

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("List events error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve events",
      data: null,
    });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await getPublishedEventById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Get event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve event",
      data: null,
    });
  }
}

export async function createNewEvent(req, res) {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid event data",
        data: formatValidationError(result.error),
      });
    }

    const event = await createEvent(req.user.id, result.data);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create event",
      data: null,
    });
  }
}

export async function updateExistingEvent(req, res) {
  try {
    const result = updateEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid event data",
        data: formatValidationError(result.error),
      });
    }

    const event = await updateEvent(
      req.params.id,
      req.user.id,
      req.user.role,
      result.data,
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Update event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update event",
      data: null,
    });
  }
}

export async function deleteEvent(req, res) {
  try {
    const event = await cancelEvent(req.params.id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      data: event,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Cancel event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel event",
      data: null,
    });
  }
}

export async function listCategories(req, res) {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      success: true,
      message: "Event categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error("List categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve event categories",
      data: null,
    });
  }
}

export async function createNewCategory(req, res) {
  try {
    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid category data",
        data: formatValidationError(result.error),
      });
    }

    const category = await createCategory(result.data.name);

    return res.status(201).json({
      success: true,
      message: "Event category created successfully",
      data: category,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create event category",
      data: null,
    });
  }
}
