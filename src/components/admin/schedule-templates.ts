/**
 * Templates offered on the schedule page. They double as the format
 * reference: `import-posts.ts` reads exactly these shapes.
 */

export const MARKDOWN_TEMPLATE = `# How Reddit Helps Your Brand Show Up in ChatGPT
Date: 2026-11-03
Time: 09:00
Author: Sublime Plus Cofounder
Excerpt: Why Reddit threads shape what AI tools say about your brand, and how to show up in them the right way.
Image prompt: A laptop on a wooden desk showing a forum thread, soft morning light, deep green tones

Write the post here. Leave one empty line between paragraphs.

## A subheading inside the post

Use **bold**, *italics*, [links](https://sublime-plus.com) and lists:

- First point
- Second point

# Second Post Title Goes Here
Date: 2026-11-05
Time: 18:30
Excerpt: One or two sentences that sum the post up for Google and the blog cards.
Image: https://example.com/my-photo.jpg

The text of the second post.

# Third Post: Only the Title, Date and Text Are Required
Date: 2026-11-07

No time means 09:00. No author means "Sublime Plus Cofounder". No excerpt means
the first paragraph is used. No image means a cover is made for you.
`;

export const CSV_TEMPLATE = `title,date,time,author,excerpt,image,image_prompt,body
"How Reddit Helps Your Brand Show Up in ChatGPT",2026-11-03,09:00,Sublime Plus Cofounder,"Why Reddit threads shape what AI tools say about your brand.",,"A laptop on a desk showing a forum thread, deep green tones","Write the post here.

## A subheading

Paragraphs, **bold** and lists work as in Markdown."
"Second Post Title",2026-11-05,18:30,,"One or two sentences for Google and the blog cards.",https://example.com/my-photo.jpg,,"The text of the second post."
`;
