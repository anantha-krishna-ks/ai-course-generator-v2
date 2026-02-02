// Mock data for version history
export const mockVersionHistory = [
  {
    id: 1,
    content: "<h2>Welcome to Advanced Web Development</h2><p>This course covers modern web development practices including React, TypeScript, and more. You'll learn industry-standard tools and techniques.</p>",
    editedBy: "John Smith",
    editedAt: new Date("2025-10-14T10:30:00"),
  },
  {
    id: 2,
    content: "<h2>Introduction to Web Development</h2><p>Learn the fundamentals of web development with hands-on projects and real-world examples.</p>",
    editedBy: "Sarah Johnson",
    editedAt: new Date("2025-10-13T15:45:00"),
  },
  {
    id: 3,
    content: "<h2>Web Development Fundamentals</h2><p>A comprehensive introduction to building modern web applications.</p>",
    editedBy: "Mike Davis",
    editedAt: new Date("2025-10-12T09:20:00"),
  },
];

// Mock image version history with token data
export const mockImageVersionHistory = [
  {
    id: 1,
    operation: "Image Generation/Regeneration - Course Image",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
    editedBy: "John Smith",
    editedAt: new Date("2025-10-13T14:32:00"),
    inputTokens: 0,
    outputTokens: 0
  },
  {
    id: 2,
    operation: "Image Generation/Regeneration - d) Calculate variable overhead total, expenditure and efficiency variance [S]",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
    editedBy: "Sarah Johnson",
    editedAt: new Date("2025-10-13T13:26:00"),
    inputTokens: 1,
    outputTokens: 1
  },
];

export const layoutTemplates = [
  { id: "layout1", preview: "Layout 1" },
  { id: "layout2", preview: "Layout 2" },
  { id: "layout3", preview: "Layout 3" },
  { id: "layout4", preview: "Layout 4" },
  { id: "layout5", preview: "Layout 5" },
];
