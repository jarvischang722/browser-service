CREATE TABLE player_user (
  id BIGINT(20) PRIMARY KEY AUTO_INCREMENT  NOT NULL,
  username VARCHAR(255) NOT NULL ,
  salt VARCHAR(8) NOT NULL ,
  password VARCHAR(255) NOT NULL ,
  name VARCHAR(50) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  im_type VARCHAR(20) NULL COMMENT 'Instant messaging type',
  im_account VARCHAR(100) NULL COMMENT 'Instant messaging account',
  gender VARCHAR(1) NULL COMMENT 'M | F',
  birthdate DATE NULL COMMENT 'format (yyyy-mm-dd)',
  citizenship VARCHAR(50) NULL COMMENT 'Country of Citizenship',
  referral_code VARCHAR(50) NULL COMMENT 'Player recommendation code',
  status VARCHAR(1) NULL DEFAULT '1' COMMENT '0: Prohibited use ; 1: Allow use', 
  disable_expire DATE NULL COMMENT 'Expiration date of suspension', 
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX username_UNIQUE (username ASC));