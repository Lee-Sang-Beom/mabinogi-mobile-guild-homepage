"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    { title: "길드 소개", href: "/#about" },
    { title: "길드 특징", href: "/#features" },
    { title: "길드 활동", href: "/#activities" },
    { title: "길드 가입", href: "/register" },
    { title: "로그인", href: "/login" },
    { title: "공지사항", href: "/announcements" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-primary/20">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <Link href="/" className="flex items-center gap-2 mb-8">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="font-cinzel text-white text-xl font-bold">
                M
              </span>
            </motion.div>
            <span className="font-cinzel text-xl font-bold text-primary">
              마비노기 길드
            </span>
          </Link>

          <div className="flex justify-center space-x-10 mb-8">
            {socialLinks.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="text-muted-foreground hover:text-primary"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="sr-only">소셜 미디어</span>
                <item.icon className="h-6 w-6" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.nav
          className="mb-8 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {footerLinks.map((item) => (
            <div key={item.title} className="pb-6">
              <Link
                href={item.href}
                className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
            </div>
          ))}
        </motion.nav>

        <motion.p
          className="text-center text-sm leading-5 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          &copy; {new Date().getFullYear()} 마비노기 모바일 길드. All rights
          reserved.
        </motion.p>
      </div>
    </footer>
  );
}
