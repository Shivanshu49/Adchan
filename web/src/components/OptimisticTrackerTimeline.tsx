"use client";

import TrackerTimeline from "@/components/TrackerTimeline";
import { useOptimisticTracker } from "@/components/TrackerOptimisticProvider";
import type { Failure } from "@/types/failures";


export default function OptimisticTrackerTimeline({ failure }: { failure: Failure }) {
  const { record } = useOptimisticTracker();
  return <TrackerTimeline record={record} failure={failure} />;
}
