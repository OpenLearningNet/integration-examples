import fetch from "node-fetch";
import { TextEncoder } from "util";

/*

{
    "token": "{ JWT to authenticate this response }",
    "timestamp": 123456, // Time at which this response is to be recorded
    "status": "success", // Status to report back (and decides the icon), may also be 'error', or 'pending'
    "score": {
        "value": 1, // A numeric score. May be a numerator (if no max provided) or a float value from 0 to 1
        "max": 5, // Optional, a denominator for the score (defaults to 1)
        "type": "score", // How to display the score, may also be 'pie' to display a number as a pie chart
        "color": "#FF0000" // Colour to display the score
    },
    "text": {
        "value": "Tests Passed", // text status to display
        "color": "#404040", // optional, colour of the text, defaults to score display
    },
    "link": {
        // Link to display alongside the status
        "text": "Click to view report",
        "url": "https://www.example.com"
    },
    "feedback": [
        // A list of feedback, outputs, or responses to provide alongside the Post, of various media types
        {
            "type": "iframe",
            "title": "Results",
            "url": "https://www.example.com",
            "text": "Feedback text",
            "caption": "Caption"
        },
        {
            "type": "image",
            "title": "Image Title",
            "url": "https://www.example.com/example.jpg",
            "caption": "An Example Image"
        },
        {
            "type": "text",
            "title": "Sample Text Title",
            "text": "Sample Text"
        }
    ],
    "visibility": "class", // optional, can also be "author", or "staff", this determines who can see the status and link (but not the feedback)
    "moderation": {
        "permission": "author",  // optional, can also be "class" or "staff", changes the entire Post's access permission
        "report": true // optional, reports this post (auto-moderation)
    },
    "notification": {
        // Optional, create a notification to the user
        "text": "Results available"
    }
}
*/

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

export interface ResponseData {
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
  moderation?: {
    permission: "author" | "class" | "staff";
    report?: boolean;
  };
  notification?: {
    text: string;
  };
}

export const sendResponseToOpenLearning = (returnUrl: string, responseData: ResponseData) => {
  return fetch(returnUrl, {
    method: 'post',
    body: JSON.stringify(responseData),
    headers: { 'Content-Type': 'application/json' }
  });
};
