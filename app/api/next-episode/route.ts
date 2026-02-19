import { NextRequest, NextResponse } from "next/server";
import { getAuthData } from "@/src/actions";
import { createJellyfinInstance } from "@/src/lib/utils";
import { getItemsApi } from "@jellyfin/sdk/lib/utils/api/items-api";
import { BaseItemKind } from "@jellyfin/sdk/lib/generated-client/models/base-item-kind";
import { ItemFields } from "@jellyfin/sdk/lib/generated-client/models/item-fields";
import { ItemSortBy } from "@jellyfin/sdk/lib/generated-client/models/item-sort-by";
import { SortOrder } from "@jellyfin/sdk/lib/generated-client/models/sort-order";

export async function GET(request: NextRequest) {
  try {
    const seasonId = request.nextUrl.searchParams.get("seasonId");
    const episodeNumber = request.nextUrl.searchParams.get("episodeNumber");

    if (!seasonId || !episodeNumber) {
      return NextResponse.json(
        { error: "Missing seasonId or episodeNumber" },
        { status: 400 }
      );
    }

    const { serverUrl, user } = await getAuthData();
    
    if (!user.AccessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const jellyfinInstance = createJellyfinInstance();
    const api = jellyfinInstance.createApi(serverUrl);
    api.accessToken = user.AccessToken;

    const itemsApi = getItemsApi(api);
    const { data } = await itemsApi.getItems({
      userId: user.Id,
      parentId: seasonId,
      includeItemTypes: [BaseItemKind.Episode],
      recursive: false,
      sortBy: [ItemSortBy.SortName],
      sortOrder: [SortOrder.Ascending],
      fields: [
        ItemFields.CanDelete,
        ItemFields.PrimaryImageAspectRatio,
        ItemFields.Overview,
        ItemFields.MediaSources,
      ],
    });

    if (!data.Items || data.Items.length === 0) {
      return NextResponse.json(
        { nextEpisode: null, hasNext: false },
        { status: 200 }
      );
    }

    const currentEpisodeNum = parseInt(episodeNumber, 10);
    const currentIndex = data.Items.findIndex(
      (ep: any) => ep.IndexNumber === currentEpisodeNum
    );

    // Check if there's a next episode
    if (currentIndex >= 0 && currentIndex < data.Items.length - 1) {
      const nextEpisode = data.Items[currentIndex + 1];
      return NextResponse.json(
        { nextEpisode, hasNext: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { nextEpisode: null, hasNext: false },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch next episode", details: String(error) },
      { status: 500 }
    );
  }
}
