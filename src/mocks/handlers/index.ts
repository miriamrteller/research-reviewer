import { feedbackHandlers } from './feedback'
import { healthHandlers } from './health'
import { reviewHandlers } from './review'

/** Every mock handler. Add a resource's handlers here when its schema exists. */
export const handlers = [...healthHandlers, ...reviewHandlers, ...feedbackHandlers]
