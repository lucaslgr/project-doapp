-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.11-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Copiando estrutura do banco de dados para project-doapp
CREATE DATABASE IF NOT EXISTS `project-doapp` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `project-doapp`;

-- Copiando estrutura para tabela project-doapp.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `image` varchar(150) CHARACTER SET utf8 NOT NULL,
  `location` varchar(150) CHARACTER SET utf8 NOT NULL,
  `title` varchar(100) CHARACTER SET utf8 NOT NULL,
  `date_created` datetime NOT NULL,
  `status` tinyint(1) NOT NULL COMMENT '0 - ativado | 1 - desativado',
  `whatsapp_contact` varchar(20) CHARACTER SET utf8 NOT NULL,
  `longitude` float DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `id_user` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela project-doapp.posts: ~0 rows (aproximadamente)
DELETE FROM `posts`;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;

-- Copiando estrutura para tabela project-doapp.subscriptions_wpn
CREATE TABLE IF NOT EXISTS `subscriptions_wpn` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `navigator_endpoint` varchar(300) CHARACTER SET utf8 NOT NULL,
  `key_p256dh` varchar(255) CHARACTER SET utf8 NOT NULL,
  `key_auth` varchar(255) CHARACTER SET utf8 NOT NULL,
  `expiration_time` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela project-doapp.subscriptions_wpn: ~48 rows (aproximadamente)
DELETE FROM `subscriptions_wpn`;
/*!40000 ALTER TABLE `subscriptions_wpn` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions_wpn` ENABLE KEYS */;

-- Copiando estrutura para tabela project-doapp.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '0',
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '0',
  `password` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela project-doapp.users: ~1 rows (aproximadamente)
DELETE FROM `users`;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
