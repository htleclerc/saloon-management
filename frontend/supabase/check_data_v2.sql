-- CHECK DATA FOR SALON 2 (LYON)
SELECT 
    (SELECT COUNT(*) FROM expenses WHERE salon_id = 2) as expenses_count,
    (SELECT COUNT(*) FROM incomes WHERE salon_id = 2) as incomes_count,
    (SELECT COUNT(*) FROM bookings WHERE salon_id = 2) as bookings_count,
    (SELECT COUNT(*) FROM workers WHERE salon_id = 2) as workers_count,
    (SELECT COUNT(*) FROM clients WHERE salon_id = 2) as clients_count;

-- CHECK IF STATUSES ARE CORRECT
SELECT status, COUNT(*) FROM incomes WHERE salon_id = 2 GROUP BY status;
SELECT status, COUNT(*) FROM bookings WHERE salon_id = 2 GROUP BY status;
