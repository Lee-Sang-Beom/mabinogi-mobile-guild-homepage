import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getNoticeThumbnailImageSrc } from "@/shared/notice/utils";
import { ApiResponse } from "@/shared/types/api";
import { NoticeResponse } from "@/shared/notice/api";

interface IProps {
  data: ApiResponse<NoticeResponse | null> | undefined;
}
export default function DashboardArtwork({ data }: IProps) {
  return (
    <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
          <ImageIcon className="h-5 w-5 text-primary" />
          최신 아트워크
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col justify-between overflow-hidden ">
        <div className="space-y-4 flex-grow">
          {data && data.data ? (
            <Link
              href={`/community/${data.data.docId}?tab=artwork`}
              className="space-y-4 flex-grow"
            >
              <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
                <Image
                  src={
                    getNoticeThumbnailImageSrc(data.data.content) ||
                    "/images/bg-mabinogi-mobile-sky-user.jpg"
                  }
                  alt={data.data.title}
                  fill
                  className="object-contain transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-medium">{data.data.title}</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  by {data.data.writeUserId} • {data.data.mngDt}
                </p>
              </div>
            </Link>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
                <Image
                  src={"/images/bg-mabinogi-mobile-sky-user.jpg"}
                  alt={"아트워크 썸네일 부재 시, 기본 이미지"}
                  fill
                  className="object-contain transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="flex w-full gap-3 items-center justify-center mt-1">
                  <Info className="w-5 h-5 text-blue-500" />
                  {"작성된 아트워크 정보가 없습니다."}
                </h3>
              </div>
            </>
          )}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary/10 transition-colors duration-300"
            >
              <Link
                href="/community?tab=artwork"
                className="flex items-center justify-center w-full"
              >
                아트워크 페이지 이동
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
                  className="ml-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
