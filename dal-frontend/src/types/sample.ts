export type SampleType = 'text' | 'image' | 'data';

export interface Sample {
  id: string;
  type?: SampleType;
  content?: string;
  data?: number[];
  uncertainty?: number;
  predicted_label?: any;
  features?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface VoteStatus {
  totalVotes: number;
  currentVotes: number;
  voteCounts: Record<string, number>;
  isFinalized: boolean;
  winningLabel?: string;
}

export type VoteStatusType = 'idle' | 'voting' | 'submitted' | VoteStatus;

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  f1Score?: number;
  labeledCount?: number;
  totalSamples?: number;
  lastUpdated?: string;
  model_info?: {
    library: string;
    algorithm: string;
    parameters: Record<string, any>;
  };
  query_strategy?: {
    name: string;
    method: string;
    description: string;
    batch_size: number;
  };
  update_config?: {
    strategy: string;
    batch_size: number;
    min_samples_for_update: number;
  };
} 