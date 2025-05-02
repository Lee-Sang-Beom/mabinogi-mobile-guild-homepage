import { AnimatedLoading } from '@/components/animated-loading'

export default function Loading() {
  return <AnimatedLoading
    variant="fullscreen"
    text={'로딩 중입니다...'}
  />
}