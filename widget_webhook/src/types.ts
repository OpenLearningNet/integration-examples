interface IframeFeedback {
  type: "iframe";
  title: string;
  url: string;
  caption?: string;
}

interface TextFeedback {
  type: "text";
  title: string;
  text: string;
}

interface MediaFeedback {
  type: "image" | "video" | "audio";
  title: string;
  url: string;
  caption?: string;
}

export type Feedback = IframeFeedback | TextFeedback | MediaFeedback;

export interface WebhookReturnData {
  token: string;
  timestamp: number;
  status: string;
  text: {
    value: string;
    color?: string;
  };
  score?: {
    value: number;
    max?: number;
    type?: "score" | "pie";
    color?: string;
  };
  link?: {
    text: string;
    url: string;
  };
  feedback?: Array<Feedback>;
  visibility?: "author" | "class" | "staff";
  
  // Not yet implemented:
  moderation?: {
    permission: "author" | "class" | "staff";
    report?: boolean;
  };
  notification?: {
    text: string;
  };
}

interface ContentPostData {
  content: string;
}

interface MediaPostData {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

interface FilesPostData {
  files: Array<{
    url: string;
    contentType: string;
    filename: string;
    size: number;
  }>;
}

interface AttachmentsPostData {
  attachments: Array<{
    name: string;
    displayType:
      | "content"
      | "code-content"
      | "image-url"
      | "audio-url"
      | "video-url"
      | "embed-url"
      | "link-url";
    contentType: string;
    content: string;
    height?: number;
    caption?: string;
    meta?: any;
  }>;
}

export type PostData =
  | ContentPostData
  | MediaPostData
  | FilesPostData
  | AttachmentsPostData;

export interface WebhookIncomingData {
  url: string;
  token: string;
  user: string;
  name: string;
  post: {
    id: string;
    sourceBlock: string;
    sourceUrl: string;
    text: string;
    data: PostData;
    type: "url" | "video" | "image" | "text" | "html" | "files" | "attachments";
    createdAt: number;
  };
  class: string;
  course: string;
  returnUrl: string;
}
