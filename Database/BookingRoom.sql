CREATE DATABASE HotelBookingDB;
GO
USE HotelBookingDB;
GO

-- Bảng User (có thêm Points)
CREATE TABLE [User] (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) COLLATE SQL_Latin1_General_CP1_CS_AS UNIQUE,
    PasswordHash NVARCHAR(255) COLLATE SQL_Latin1_General_CP1_CS_AS,
    PhoneNumber NVARCHAR(15),
    Email NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CS_AS UNIQUE,
    CreateAt DATETIME DEFAULT GETDATE(),
    FullName NVARCHAR(255),
    Points INT DEFAULT 0,
    Role NVARCHAR(50),
    Token NVARCHAR(255),
    TokenExpiry DATETIME
);

-- Bảng RoomType
CREATE TABLE RoomType (
    RoomTypeID INT IDENTITY(1,1) PRIMARY KEY,
    RoomTypeName NVARCHAR(50),
    Description NVARCHAR(255),
    Price DECIMAL(10,2),
    ValidDate DATETIME
);

-- Bảng Rooms
CREATE TABLE Rooms (
    RoomID INT IDENTITY(1,1) PRIMARY KEY,
    RoomNumber NVARCHAR(50),
    RoomTypeID INT,
	StartDate DATE,
	EndDate DATE,
    Status NVARCHAR(20) DEFAULT 'Available',
    FOREIGN KEY (RoomTypeID) REFERENCES RoomType(RoomTypeID)
);

-- Bảng RoomMedia
CREATE TABLE RoomMedia (
    MediaID INT IDENTITY(1,1) PRIMARY KEY,
    RoomID INT,
    Media_Link NVARCHAR(255),
    Description NVARCHAR(255),
    MediaType NVARCHAR(50),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- Bảng Bookings (có thêm StaffID nếu cần)
CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    RoomID INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CheckInDate DATETIME,
    CheckOutDate DATETIME,
    BookingStatus NVARCHAR(20) DEFAULT 'Pending',
    TotalAmount DECIMAL(10,2),
    UpdatedAt DATETIME,
    StaffID INT NULL,
    FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    FOREIGN KEY (StaffID) REFERENCES [User](UserID),
    CONSTRAINT CHK_BookingStatus CHECK (BookingStatus IN ('Pending', 'Confirmed', 'Cancelled', 'Completed'))
);

-- Bảng Payments
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    BookingID INT,
    PaymentType NVARCHAR(20),
    PaymentDate DATE,
    TotalPrice DECIMAL(10,2),
    PaymentStatus NVARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID),
);

-- Bảng PointTransactions
CREATE TABLE PointTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    BookingID INT NULL,
    Points INT NOT NULL,
    TransactionType NVARCHAR(20) NOT NULL,
    TransactionDate DATETIME DEFAULT GETDATE(),
    Description NVARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

CREATE TRIGGER trg_AfterPaymentInsert
ON Payments
AFTER INSERT
AS
BEGIN
    DECLARE @UserID INT, @BookingID INT, @TotalPrice DECIMAL(10,2), @PointsEarned INT;

    SELECT @BookingID = BookingID, @TotalPrice = TotalPrice
    FROM INSERTED;

    SELECT @UserID = UserID
    FROM Bookings
    WHERE BookingID = @BookingID;

    SET @PointsEarned = FLOOR(@TotalPrice / 10);

    INSERT INTO PointTransactions (UserID, BookingID, Points, TransactionType, Description)
    VALUES (@UserID, @BookingID, @PointsEarned, 'Earned', 'Tích điểm từ thanh toán Booking #' + CAST(@BookingID AS NVARCHAR(10)));

    UPDATE [User]
    SET Points = Points + @PointsEarned
    WHERE UserID = @UserID;
END;


-- Thêm 10 bản ghi vào bảng RoomType
INSERT INTO RoomType (RoomTypeName, Description, Price, ValidDate) VALUES
(N'Single', N'Phòng đơn nhỏ gọn', 300000.00, '2025-12-31'),
(N'Twin', N'Phòng đôi với 2 giường đơn', 600000.00, '2025-12-31'),
(N'Family', N'Phòng gia đình rộng rãi', 1200000.00, '2025-12-31'),
(N'Executive', N'Phòng dành cho doanh nhân', 1000000.00, '2025-12-31'),
(N'Premium', N'Phòng cao cấp với tiện nghi hiện đại', 900000.00, '2025-12-31'),
(N'Superior', N'Phòng tiện nghi với không gian thoải mái', 700000.00, '2025-12-31'),
(N'Budget', N'Phòng giá rẻ cho khách tiết kiệm', 250000.00, '2025-12-31'),
(N'Luxury', N'Phòng sang trọng với dịch vụ cao cấp', 2000000.00, '2025-12-31'),
(N'Studio', N'Phòng kiểu căn hộ nhỏ', 850000.00, '2025-12-31'),
(N'Penthouse', N'Phòng trên cao với tầm nhìn toàn cảnh', 3000000.00, '2025-12-31');

-- Thêm 10 bản ghi vào bảng Rooms
INSERT INTO Rooms (RoomNumber, RoomTypeID, StartDate, EndDate, Status) VALUES
(N'103', 4, '2025-01-01', '2025-12-31', 'Available'),
(N'104', 5, '2025-01-01', '2025-12-31', 'Available'),
(N'202', 6, '2025-01-01', '2025-12-31', 'Available'),
(N'203', 7, '2025-01-01', '2025-12-31', 'Available'),
(N'302', 8, '2025-01-01', '2025-12-31', 'Available'),
(N'303', 9, '2025-01-01', '2025-12-31', 'Available'),
(N'401', 10, '2025-01-01', '2025-12-31', 'Available'),
(N'402', 4, '2025-01-01', '2025-12-31', 'Available'),
(N'501', 5, '2025-01-01', '2025-12-31', 'Available'),
(N'502', 6, '2025-01-01', '2025-12-31', 'Available');

-- Thêm 10 bản ghi vào bảng RoomMedia
INSERT INTO RoomMedia (RoomID, Media_Link, Description, MediaType) VALUES
(5, 'https://example.com/room103.jpg', N'Hình ảnh phòng 103', 'Image'),
(6, 'https://example.com/room104.jpg', N'Hình ảnh phòng 104', 'Image'),
(7, 'https://example.com/room202.jpg', N'Hình ảnh phòng 202', 'Image'),
(8, 'https://example.com/room203.jpg', N'Hình ảnh phòng 203', 'Image'),
(9, 'https://example.com/room302.jpg', N'Hình ảnh phòng 302', 'Image'),
(10, 'https://example.com/room303.jpg', N'Hình ảnh phòng 303', 'Image'),
(11, 'https://example.com/room401.jpg', N'Hình ảnh phòng 401', 'Image'),
(12, 'https://example.com/room402.jpg', N'Hình ảnh phòng 402', 'Image'),
(13, 'https://example.com/room501.jpg', N'Hình ảnh phòng 501', 'Image'),
(14, 'https://example.com/room502.jpg', N'Hình ảnh phòng 502', 'Image');

-- Thêm 10 bản ghi vào bảng Bookings (giả sử UserID 4-13 tồn tại trong bảng [User])
INSERT INTO Bookings (UserID, RoomID, CheckInDate, CheckOutDate, BookingStatus, TotalAmount, UpdatedAt, StaffID) VALUES
(4, 5, '2025-04-25 14:00:00', '2025-04-27 12:00:00', 'Confirmed', 2000000.00, GETDATE(), 2),
(5, 6, '2025-04-26 14:00:00', '2025-04-28 12:00:00', 'Pending', 1800000.00, GETDATE(), NULL),
(6, 7, '2025-04-27 14:00:00', '2025-04-29 12:00:00', 'Confirmed', 1400000.00, GETDATE(), 2),
(7, 8, '2025-04-28 14:00:00', '2025-04-30 12:00:00', 'Cancelled', 500000.00, GETDATE(), 2),
(8, 9, '2025-05-01 14:00:00', '2025-05-03 12:00:00', 'Pending', 4000000.00, GETDATE(), NULL),
(9, 10, '2025-05-02 14:00:00', '2025-05-04 12:00:00', 'Confirmed', 1700000.00, GETDATE(), 2),
(10, 11, '2025-05-03 14:00:00', '2025-05-05 12:00:00', 'Completed', 6000000.00, GETDATE(), 2),
(11, 12, '2025-05-04 14:00:00', '2025-05-06 12:00:00', 'Pending', 2000000.00, GETDATE(), NULL),
(12, 13, '2025-05-05 14:00:00', '2025-05-07 12:00:00', 'Confirmed', 1800000.00, GETDATE(), 2),
(13, 14, '2025-05-06 14:00:00', '2025-05-08 12:00:00', 'Cancelled', 1400000.00, GETDATE(), 2);

-- Thêm 10 bản ghi vào bảng Payments
INSERT INTO Payments (BookingID, PaymentType, PaymentDate, TotalPrice, PaymentStatus) VALUES
(4, 'CreditCard', '2025-04-24', 2000000.00, 'Completed'),
(5, 'Cash', '2025-04-26', 1800000.00, 'Pending'),
(6, 'CreditCard', '2025-04-27', 1400000.00, 'Completed'),
(7, 'BankTransfer', '2025-04-28', 500000.00, 'Cancelled'),
(8, 'CreditCard', '2025-05-01', 4000000.00, 'Pending'),
(9, 'Cash', '2025-05-02', 1700000.00, 'Completed'),
(10, 'CreditCard', '2025-05-03', 6000000.00, 'Completed'),
(11, 'BankTransfer', '2025-05-04', 2000000.00, 'Pending'),
(12, 'CreditCard', '2025-05-05', 1800000.00, 'Completed'),
(13, 'Cash', '2025-05-06', 1400000.00, 'Cancelled');

-- Thêm 10 bản ghi vào bảng PointTransactions
INSERT INTO PointTransactions (UserID, BookingID, Points, TransactionType, TransactionDate, Description) VALUES
(4, 4, 200, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 4'),
(5, 5, 180, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 5'),
(6, 6, 140, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 6'),
(7, 7, -50, 'Redeem', GETDATE(), N'Sử dụng điểm để giảm giá đặt phòng 7'),
(8, 8, 400, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 8'),
(9, 9, 170, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 9'),
(10, 10, 600, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 10'),
(11, 11, -100, 'Redeem', GETDATE(), N'Sử dụng điểm để giảm giá đặt phòng 11'),
(12, 12, 180, 'Earn', GETDATE(), N'Điểm tích lũy từ đặt phòng 12'),
(13, 13, -70, 'Redeem', GETDATE(), N'Sử dụng điểm để giảm giá đặt phòng 13');