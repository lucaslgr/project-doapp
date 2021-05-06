--
-- Database: `project-doapp`
--
CREATE DATABASE IF NOT EXISTS `project-doapp` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `project-doapp`;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) UNSIGNED NOT NULL,
  `image` varchar(150) CHARACTER SET utf8 NOT NULL,
  `location` varchar(150) CHARACTER SET utf8 NOT NULL,
  `title` varchar(100) CHARACTER SET utf8 NOT NULL,
  `date_created` datetime NOT NULL,
  `status` tinyint(1) NOT NULL COMMENT '0 - ativado | 1 - desativado',
  `whatsapp_contact` varchar(20) CHARACTER SET utf8 NOT NULL,
  `longitude` float DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `id_user` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `image`, `location`, `title`, `date_created`, `status`, `whatsapp_contact`, `longitude`, `latitude`, `id_user`) VALUES
(164, 'http://localhost/project-doapp/backend-api/public/Images/4f2b54f6e5.png', 'Rua Joao Garcia 81, Cataguases - Minas Gerais, 33774, Brazil', 'Teste', '2020-08-27 11:26:22', 0, '(32) 98809-4352', -42.6979, -21.3825, 8),
(165, 'http://localhost/project-doapp/backend-api/public/Images/68c6b6aa24.png', 'São Paulo', 'Teste', '2020-09-29 23:20:34', 0, '(32) 98809-4352', -42.6979, -21.3825, 8);

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions_wpn`
--

CREATE TABLE `subscriptions_wpn` (
  `id` int(11) UNSIGNED NOT NULL,
  `navigator_endpoint` varchar(300) CHARACTER SET utf8 NOT NULL,
  `key_p256dh` varchar(255) CHARACTER SET utf8 NOT NULL,
  `key_auth` varchar(255) CHARACTER SET utf8 NOT NULL,
  `expiration_time` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '0',
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '0',
  `password` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(8, 'Lucas', 'lucaslgr1206@gmail.com', '$2y$10$WaVSZ3xEiMpp.XONxf3/UeqUuWgnM0odZq9oUThASiS4Bq.ULAxrG');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions_wpn`
--
ALTER TABLE `subscriptions_wpn`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `subscriptions_wpn`
--
ALTER TABLE `subscriptions_wpn`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
