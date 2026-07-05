CREATE DATABASE IF NOT EXISTS campus_events;
USE campus_events;

CREATE TABLE roles (
  roleID INT AUTO_INCREMENT PRIMARY KEY,
  roleName VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (roleName) VALUES ('Student'), ('Organizer'), ('Admin');

CREATE TABLE venues (
  venueID INT AUTO_INCREMENT PRIMARY KEY,
  venueName VARCHAR(200) NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  userID INT AUTO_INCREMENT PRIMARY KEY,
  roleID INT NOT NULL,
  roleChangeReason TEXT,
  fullName VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  status ENUM('Active', 'Disabled') NOT NULL DEFAULT 'Active',
  emailVerifiedAt TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roleID) REFERENCES roles(roleID) ON DELETE RESTRICT
);

CREATE TABLE categories (
  categoryID INT AUTO_INCREMENT PRIMARY KEY,
  categoryName VARCHAR(100) NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (categoryName) VALUES
('Academic'), ('Social'), ('Sports'), ('Career'), ('Culture'), ('Workshop');

CREATE TABLE events (
  eventID INT AUTO_INCREMENT PRIMARY KEY,
  organizerID INT NOT NULL,
  categoryID INT NOT NULL,
  venueID INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  eventDate DATE NOT NULL,
  startTime TIME,
  endTime TIME,
  status ENUM('Draft', 'Active', 'Removed', 'Archived', 'Cancelled') NOT NULL DEFAULT 'Active',
  removedReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizerID) REFERENCES users(userID) ON DELETE CASCADE,
  FOREIGN KEY (categoryID) REFERENCES categories(categoryID) ON DELETE RESTRICT,
  FOREIGN KEY (venueID) REFERENCES venues(venueID) ON DELETE RESTRICT
);

CREATE TABLE attendance (
  attendanceID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  eventID INT NOT NULL,
  hasCheckedIn BOOLEAN NOT NULL DEFAULT FALSE,
  rsvpAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checkedInAt TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY unique_rsvp (userID, eventID),
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
  FOREIGN KEY (eventID) REFERENCES events(eventID) ON DELETE CASCADE
);

CREATE TABLE qr_codes (
  qrID INT AUTO_INCREMENT PRIMARY KEY,
  attendanceID INT NOT NULL UNIQUE,
  token VARCHAR(128) NOT NULL UNIQUE,
  fallbackCode CHAR(6) NOT NULL UNIQUE,
  generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scannedAt TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (attendanceID) REFERENCES attendance(attendanceID) ON DELETE CASCADE
);

CREATE TABLE feedback (
  feedbackID INT AUTO_INCREMENT PRIMARY KEY,
  attendanceID INT NOT NULL UNIQUE,
  starRating TINYINT NOT NULL CHECK (starRating BETWEEN 1 AND 5),
  comment TEXT,
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attendanceID) REFERENCES attendance(attendanceID) ON DELETE CASCADE
);

CREATE TABLE reports (
  reportID INT AUTO_INCREMENT PRIMARY KEY,
  eventID INT NOT NULL UNIQUE,
  generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (eventID) REFERENCES events(eventID) ON DELETE CASCADE
);

CREATE TABLE organizer_requests (
  requestID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  clubName VARCHAR(120) NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewedAt TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

INSERT INTO venues (venueName) VALUES
('Nairobi Hall'),('Computer Lab B2'),('Main Auditorium'),('Innovation Hub'),('LT3'),('Courtyard'),('Sports Ground');

INSERT INTO events (organizerID, categoryID, venueID, title, description, eventDate, startTime, endTime, status) VALUES
(1, 4, 1, 'Tech Career Fair 2025', 'Annual fair connecting students with top employers in tech, finance and consulting. Bring printed copies of your CV. Smart casual dress required.', '2025-11-14', '10:00:00', '16:00:00', 'Active'),
(1, 1, 5, 'AI & Society Panel', 'Faculty and industry speakers discuss the ethics and impact of artificial intelligence on society and the job market.', '2025-11-19', '14:00:00', '16:00:00', 'Active'),
(1, 2, 6, 'End of Semester Social', 'Wind down the semester with music, food stalls and student performances. All students welcome.', '2025-11-22', '18:00:00', '22:00:00', 'Active'),
(1, 6, 2, 'Python Workshop Series 3', 'Hands-on session covering data structures, list comprehension and file I/O. Bring your laptop.', '2025-11-18', '09:00:00', '11:00:00', 'Active'),
(1, 3, 7, 'Inter-Faculty Football Tournament', 'Annual football tournament between faculties. Come and cheer your team to victory.', '2025-11-25', '08:00:00', '17:00:00', 'Active'),
(1, 5, 3, 'Culture Week Opening Ceremony', 'Kick off Culture Week with performances, traditional food and art exhibitions from across Africa.', '2025-11-20', '11:00:00', '14:00:00', 'Active'),
(1, 1, 4, 'Entrepreneurship Bootcamp', 'Two-day bootcamp for aspiring entrepreneurs. Learn how to validate ideas, pitch to investors and build a business plan.', '2025-11-28', '09:00:00', '17:00:00', 'Active');
