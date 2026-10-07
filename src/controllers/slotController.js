import { generateSlotsForDoctorDate, holdSlotAtomic, releaseSlotHold } from '../services/slotService.js';

export function getSlots(req, res, next) {
  try {
    const doctorId = Number(req.params.doctorId);
    const dateStr = req.query.date;

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({
        success: false,
        message: 'A valid date in YYYY-MM-DD format is required.'
      });
    }

    const result = generateSlotsForDoctorDate(doctorId, dateStr);

    return res.json({
      success: true,
      doctorId,
      date: dateStr,
      onLeave: result.onLeave,
      leaveReason: result.leaveReason || null,
      noSchedule: result.noSchedule,
      count: result.slots.length,
      data: result.slots.map(s => ({
        ...s,
        is_held_by_me: req.user ? s.held_by_user_id === req.user.id : false
      }))
    });
  } catch (error) {
    next(error);
  }
}

export function holdSlot(req, res, next) {
  try {
    const slotId = Number(req.params.id);
    const userId = req.user.id;

    const result = holdSlotAtomic(slotId, userId);

    return res.status(200).json({
      success: true,
      message: 'Slot successfully reserved for 5 minutes.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export function releaseSlot(req, res, next) {
  try {
    const slotId = Number(req.params.id);
    const userId = req.user.id;

    const released = releaseSlotHold(slotId, userId);

    return res.status(200).json({
      success: true,
      message: released ? 'Slot hold released.' : 'Slot was not held by you or was already released.'
    });
  } catch (error) {
    next(error);
  }
}
