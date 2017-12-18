
ALTER TABLE browser DROP INDEX `unique_browser`;

ALTER TABLE browser ADD CONSTRAINT unique_browser_platform UNIQUE (userid, platform);

ALTER TABLE browser DROP COLUMN client;
