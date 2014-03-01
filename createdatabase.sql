CREATE DATABASE 'SilentAuction' /*!40100 DEFAULT CHARACTER SET latin1 */;

go

use 'SilentAuction'';

go


CREATE TABLE 'Bids' (
  'Id' int(11) NOT NULL AUTO_INCREMENT,
  'ItemId' int(11) NOT NULL,
  'Amount' decimal(12,2) NOT NULL,
  'UserName' varchar(45) NOT NULL,
  'CreatedDate' datetime NOT NULL,
  PRIMARY KEY ('Id'),
  UNIQUE KEY 'Id_UNIQUE' ('Id')
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

go

CREATE TABLE 'Items' (
  'Id' int(11) NOT NULL AUTO_INCREMENT,
  'Title' varchar(45) NOT NULL,
  'Description' varchar(500) NOT NULL,
  'StartDate' datetime NOT NULL,
  'EndDate' datetime NOT NULL,
  'DonatedBy' varchar(45) NOT NULL,
  'DonatedLink' varchar(45) DEFAULT NULL,
  PRIMARY KEY ('Id')
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

go

CREATE TABLE 'users' (
  'Id' int(11) NOT NULL AUTO_INCREMENT,
  'UserName' varchar(45) NOT NULL,
  'Password' varchar(255) NOT NULL,
  'IsAdmin' bit(1) NOT NULL,
  'Email' varchar(255) NOT NULL,
  'IsActive' bit(1) DEFAULT NULL,
  'ActivatedOn' datetime DEFAULT NULL,
  PRIMARY KEY ('Id'),
  UNIQUE KEY 'Id_UNIQUE' ('Id')
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1

go


CREATE USER 'silentauction'@'localhost' IDENTIFIED BY '11x6jcyKc08';

go

grant select, insert, update on SilentAuction.* to 'silentauction'@'localhost';
