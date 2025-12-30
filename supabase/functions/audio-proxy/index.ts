const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Range",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
};

Deno.serve(async (req: Request) => {
  console.log('Audio proxy request:', req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const audioUrl = url.searchParams.get('url');

    console.log('Proxying audio URL:', audioUrl);

    if (!audioUrl) {
      console.error('Missing url parameter');
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const rangeHeader = req.headers.get('Range');
    const headers: HeadersInit = {};
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
      console.log('Range request:', rangeHeader);
    }

    console.log('Fetching from:', audioUrl);
    const response = await fetch(audioUrl, { headers });

    console.log('Fetch response status:', response.status);

    if (!response.ok) {
      console.error('Failed to fetch audio:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch audio', status: response.status }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    
    const contentRange = response.headers.get('Content-Range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }
    
    const acceptRanges = response.headers.get('Accept-Ranges');
    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }

    console.log('Returning response with status:', response.status);

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(error) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});