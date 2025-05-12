"use client";

import { User } from "next-auth";
import {
  getJobClassColor,
  JobClassIcons,
} from "@/app/(auth)/dashboard/job-class-utils";
import { Sword } from "lucide-react";
import { guildRoleOptions } from "@/shared/constants/game";

interface UserCardProps {
  user: User;
  onClickAction: () => void;
}

export function UserCard({ user, onClickAction }: UserCardProps) {
  const Icon = JobClassIcons[user.job] || Sword;
  const iconColor = getJobClassColor(user.job);

  return (
    <div
      onClick={onClickAction}
      className="bg-background/40 backdrop-blur-sm rounded-lg shadow-md p-4 hover:shadow-lg transition-all cursor-pointer border hover:border-amber-300 "
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-xl shadow-md">
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {user.id}
          </p>
          <p className="text-sm text-muted-foreground truncate">{user.job}</p>
        </div>
        <div className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {guildRoleOptions.find((role) => role.value === user.role)!.name}
        </div>
      </div>
    </div>
  );
}
