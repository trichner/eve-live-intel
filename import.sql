CREATE SCHEMA eveintel;
CREATE USER 'eveintel'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON eveintel. * TO 'eveintel'@'localhost';