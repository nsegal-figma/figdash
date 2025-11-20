/**
 * Figma API Integration for FigDash
 * Uses Personal Access Token for authentication
 */

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaSlide {
  id: string;
  name: string;
}

/**
 * Get user's Figma files (filtered to Slides/FigJam)
 */
export async function getFigmaFiles(accessToken: string): Promise<FigmaFile[]> {
  try {
    const response = await fetch('https://api.figma.com/v1/me/files', {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Figma files');
    }

    const data = await response.json();

    // Filter to FigJam/Slides files and sort by most recent
    const files = data.files || [];
    return files
      .filter((f: any) => f.name.toLowerCase().includes('slide') || f.name.toLowerCase().includes('deck'))
      .sort((a: any, b: any) => new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime())
      .map((f: any) => ({
        key: f.key,
        name: f.name,
        thumbnail_url: f.thumbnail_url || '',
        last_modified: f.last_modified,
      }));
  } catch (error) {
    console.error('Error fetching Figma files:', error);
    throw error;
  }
}

/**
 * Upload image to Figma file as a new slide
 */
export async function uploadChartToFigma(
  accessToken: string,
  fileKey: string,
  imageBlob: Blob,
  chartTitle: string
): Promise<{ success: boolean; slideId?: string }> {
  try {
    // Step 1: Get the file structure to find the canvas (page) to add to
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file structure');
    }

    const fileData = await fileResponse.json();
    const canvas = fileData.document?.children?.[0]; // First page/canvas

    if (!canvas) {
      throw new Error('No canvas found in file');
    }

    // Step 2: Convert image to base64
    const base64Image = await blobToBase64(imageBlob);

    // Step 3: Create new frame with the image
    const createResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}/images`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image.split(',')[1], // Remove data:image/png;base64, prefix
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const uploadData = await createResponse.json();
    const imageRef = uploadData.meta?.images?.[0];

    if (!imageRef) {
      throw new Error('Image upload failed - no reference returned');
    }

    // Step 4: Create a new slide frame with the image
    const slideResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_id: canvas.id,
        nodes: [
          {
            type: 'FRAME',
            name: chartTitle,
            width: 1920,
            height: 1080,
            children: [
              {
                type: 'RECTANGLE',
                name: 'Chart',
                width: 1920,
                height: 1080,
                fills: [
                  {
                    type: 'IMAGE',
                    imageRef: imageRef,
                    scaleMode: 'FIT',
                  },
                ],
              },
            ],
          },
        ],
      }),
    });

    if (!slideResponse.ok) {
      throw new Error('Failed to create slide');
    }

    const slideData = await slideResponse.json();

    return {
      success: true,
      slideId: slideData.nodes?.[0]?.id,
    };
  } catch (error) {
    console.error('Error uploading to Figma:', error);
    return { success: false };
  }
}

/**
 * Helper: Convert Blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Test if token is valid
 */
export async function validateFigmaToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
