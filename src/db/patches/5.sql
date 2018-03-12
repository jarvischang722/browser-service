ALTER TABLE port DROP COLUMN client;

CREATE TABLE short (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  short varchar(255),
  `long` varchar(255),
  site_name varchar(255),
  logo_url text,
  created timestamp DEFAULT CURRENT_TIMESTAMP,
  last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
