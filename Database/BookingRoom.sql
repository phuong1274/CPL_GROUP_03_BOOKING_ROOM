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
