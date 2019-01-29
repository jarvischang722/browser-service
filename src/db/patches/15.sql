ALTER TABLE `user` 
ADD COLUMN `enable_vpn` INT DEFAULT 1 COMMENT '0: close; 1: open' AFTER `status`;