-- Fix payment_date column to allow NULL
USE kost_professional;

ALTER TABLE payments MODIFY payment_date DATE NULL;

-- Delete existing sample payments
DELETE FROM payments WHERE occupant_id IN (1, 2, 3);

-- Re-insert complete payment records
INSERT INTO payments (occupant_id, amount, payment_date, due_date, status) VALUES
-- Occupant 1 (John Doe) - 6 months
(1, 800000, '2024-01-05', '2024-01-10', 'paid'),
(1, 800000, '2024-02-05', '2024-02-10', 'paid'),
(1, 800000, NULL, '2024-03-10', 'pending'),
(1, 800000, NULL, '2024-04-10', 'pending'),
(1, 800000, NULL, '2024-05-10', 'pending'),
(1, 800000, NULL, '2024-06-10', 'pending'),
-- Occupant 2 (Jane Smith) - 12 months
(2, 1200000, '2024-02-05', '2024-02-10', 'paid'),
(2, 1200000, NULL, '2024-03-10', 'pending'),
(2, 1200000, NULL, '2024-04-10', 'pending'),
(2, 1200000, NULL, '2024-05-10', 'pending'),
(2, 1200000, NULL, '2024-06-10', 'pending'),
(2, 1200000, NULL, '2024-07-10', 'pending'),
(2, 1200000, NULL, '2024-08-10', 'pending'),
(2, 1200000, NULL, '2024-09-10', 'pending'),
(2, 1200000, NULL, '2024-10-10', 'pending'),
(2, 1200000, NULL, '2024-11-10', 'pending'),
(2, 1200000, NULL, '2024-12-10', 'pending'),
(2, 1200000, NULL, '2025-01-10', 'pending'),
-- Occupant 3 (Bob Wilson) - 3 months
(3, 1500000, '2024-03-05', '2024-03-10', 'paid'),
(3, 1500000, NULL, '2024-04-10', 'pending'),
(3, 1500000, NULL, '2024-05-10', 'pending');
