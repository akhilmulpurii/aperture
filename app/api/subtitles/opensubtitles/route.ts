import { NextRequest, NextResponse } from 'next/server';

const OPENSUBTITLES_API_URL = 'https://api.opensubtitles.com/api/v1';
const API_KEY = '';

interface OpenSubtitlesSearchParams {
  query?: string;
  type?: string;
  languages?: string;
  season?: number;
  episode?: number;
}

async function searchOpenSubtitles(params: OpenSubtitlesSearchParams) {
  // Build query parameters exactly as OpenSubtitles v3 API expects
  const queryParams = new URLSearchParams();

  if (params.query) {
    // Use 'query' parameter for full text search
    queryParams.append('query', params.query);
  }
  
  // Set language filter - OpenSubtitles v1 API uses ISO 639-1 codes
  queryParams.append('languages', 'en');
  
  // Exclude machine translated and AI translated subtitles
  queryParams.append('machine_translated', 'exclude');
  queryParams.append('ai_translated', 'exclude');
  
  // Limit results
  queryParams.append('limit', '10');

  try {
    // OpenSubtitles v1 API endpoint for searching subtitles
    const url = `${OPENSUBTITLES_API_URL}/subtitles?${queryParams.toString()}`;
    
    console.log('🔍 OpenSubtitles Search:', {
      url,
      query: params.query,
      apiKey: API_KEY ? '✓ Set' : '✗ Missing',
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY,
        'User-Agent': 'Aperture/1.0',
        'Accept': 'application/json',
      },
    });

    console.log('📊 OpenSubtitles Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenSubtitles API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      });
      throw new Error(`OpenSubtitles API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenSubtitles Data Received:', {
      count: data.data?.length || Object.keys(data).length || 0,
      hasResults: !!(data.data && data.data.length > 0) || Object.keys(data).length > 0,
    });

    // Parse and format results from OpenSubtitles v1 API
    // v1 API returns data as an object with subtitle IDs as keys
    let results: any[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      // If data is an array
      results = data.data.map((result: any) => {
        const attributes = result.attributes || result;
        return {
          id: result.id,
          name: attributes.release || attributes.filename || 'Unknown',
          language: attributes.language || 'en',
          format: attributes.format || 'srt',
          downloads: attributes.download_count || 0,
          rating: attributes.ratings || 0,
          url: attributes.url || '',
          imdbId: attributes.imdb_id || null,
        };
      });
    } else if (typeof data === 'object' && data !== null) {
      // If data is an object with IDs as keys (v1 format)
      results = Object.entries(data)
        .map(([id, result]: [string, any]) => {
          const attrs = result.attributes || result;
          return {
            id: id,
            name: attrs.release || attrs.filename || 'Unknown',
            language: attrs.language || 'en',
            format: attrs.format || 'srt',
            downloads: attrs.download_count || 0,
            rating: attrs.ratings || 0,
            url: attrs.url || '',
            imdbId: attrs.imdb_id || null,
          };
        });
    }

    // Filter to only English subtitles (client-side filtering to ensure language criteria)
    const englishResults = results.filter(r => {
      const lang = (r.language || '').toLowerCase().trim();
      // Check for various English language codes and names
      return lang === 'en' || 
             lang === 'eng' || 
             lang === 'english' ||
             lang === 'en-us' ||
             lang === 'en-gb' ||
             lang === 'en-au' ||
             lang === 'en-ca' ||
             lang === 'en-nz' ||
             lang === 'en-ie' ||
             lang === 'english (us)' ||
             lang === 'english (uk)' ||
             lang === 'english (british)' ||
             lang === 'english (american)' ||
             lang.startsWith('en-');
    }).slice(0, 5);

    console.log('🔤 Filtered to English:', {
      total: results.length,
      english: englishResults.length,
      sampleLanguages: results.slice(0, 3).map(r => r.language),
    });

    return englishResults;
  } catch (error) {
    console.error('❌ OpenSubtitles Search Failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

async function getDownloadUrl(fileId: string) {
  try {
    console.log('📥 Requesting download for file:', fileId);

    const response = await fetch(`${OPENSUBTITLES_API_URL}/download`, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
        'User-Agent': 'Aperture/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_id: fileId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Download API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      });
      throw new Error(`Download API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Download URL Retrieved:', {
      fileName: data.file_name,
      hasLink: !!data.link,
    });

    return data.link || '';
  } catch (error) {
    console.error('❌ Download Failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, fileId } = body;

    // Download endpoint - get the actual download link
    if (fileId) {
      const downloadUrl = await getDownloadUrl(fileId);
      return NextResponse.json({
        success: true,
        url: downloadUrl,
      });
    }

    // Search endpoint
    if (!query) {
      return NextResponse.json(
        { error: 'Query or fileId parameter is required' },
        { status: 400 }
      );
    }

    const results = await searchOpenSubtitles({ query });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error in OpenSubtitles API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
