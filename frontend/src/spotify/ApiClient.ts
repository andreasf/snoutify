import {ApiAlbum, CreatePlaylistResponse, PaginatedLibraryAlbums, PaginatedTracks, UserProfile} from "./response_types";
import {TokenService} from "../account/TokenService";
import {ErrorHandlingFetch} from "./ErrorHandlingFetch";

export class ApiClient {
    private apiPrefix: string;
    private errorHandlingFetch: ErrorHandlingFetch;
    private tokenService: TokenService;

    constructor(apiPrefix: string, fetch: ErrorHandlingFetch, tokenService: TokenService) {
        this.apiPrefix = apiPrefix;
        this.errorHandlingFetch = fetch;
        this.tokenService = tokenService;
    }

    public async addToPlaylist(id: string, trackUris: string[]): Promise<void> {
        const url = `${this.apiPrefix}/v1/playlists/${id}/tracks`;
        const body = {
            uris: trackUris
        } as AddToPlaylistRequest;

        await this.errorHandlingFetch.fetch("error adding tracks to playlist", url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`,
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(body),
        });
    }

    public async createPlaylist(name: string, description: string): Promise<string> {
        const url = `${this.apiPrefix}/v1/me/playlists`;
        const body = {
            name,
            description,
            public: false
        } as CreatePlaylistRequest;

        const response = await this.errorHandlingFetch.fetch("error creating playlist", url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`,
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(body),
        });

        const playlist = await response.json() as CreatePlaylistResponse;
        return playlist.id;
    }

    public async deleteAlbums(albumIds: string[]): Promise<void> {
        const url = `${this.apiPrefix}/v1/me/albums?ids=${albumIds.join(",")}`;

        await this.errorHandlingFetch.fetch("error deleting albums", url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`,
            },
        });
    }

    public async getAlbumCount(): Promise<number> {
        const url = `${this.apiPrefix}/v1/me/albums?offset=0&limit=1`;
        const response = await this.errorHandlingFetch.fetch("error retrieving album count", url, {
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`
            },
        });

        const paginatedLibraryTracks = await response.json() as PaginatedLibraryAlbums;
        return paginatedLibraryTracks.total;
    }

    public async getTrackCount(): Promise<number> {
        const url = `${this.apiPrefix}/v1/me/tracks?offset=0&limit=1`;
        const response = await this.errorHandlingFetch.fetch("error retrieving track count", url, {
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`
            },
        });

        const paginatedLibraryTracks = await response.json() as PaginatedTracks;
        return paginatedLibraryTracks.total;
    }

    public async getUsername(): Promise<string> {
        const url = `${this.apiPrefix}/v1/me`;
        const response = await this.errorHandlingFetch.fetch("error retrieving username", url, {
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`
            },
        });

        const userProfileReponse = await response.json() as UserProfile;
        return userProfileReponse.display_name;
    }

    public async getAlbumByOffset(offset: number): Promise<DepaginatedAlbum> {
        const url = `${this.apiPrefix}/v1/me/albums?offset=${offset}&limit=1`;
        const response = await this.errorHandlingFetch.fetch("error retrieving album", url, {
            headers: {
                "Authorization": `Bearer ${this.tokenService.getToken()}`
            },
        });

        const paginatedLibraryTracks = await response.json() as PaginatedLibraryAlbums;
        return await this.depaginateApiAlbum(paginatedLibraryTracks.items[0].album);
    }

    private async depaginateApiAlbum(apiAlbum: ApiAlbum): Promise<DepaginatedAlbum> {
        let nextTracksUrl = apiAlbum.tracks.next;
        let allTracks = Array.from(apiAlbum.tracks.items);

        while (nextTracksUrl) {
            const tracksPage = await this.getAlbumTracksByUrl(nextTracksUrl);
            nextTracksUrl = tracksPage.next;
            allTracks = allTracks.concat(tracksPage.items);
        }

        return {
            ...apiAlbum,
            tracks: {
                items: allTracks,
                total: apiAlbum.tracks.total,
                next: null,
            }
        } as DepaginatedAlbum;
    }

    private async getAlbumTracksByUrl(url: string): Promise<PaginatedTracks> {
        const response = await this.errorHandlingFetch.fetch(
            "error retrieving album tracks",
            url,
            {
                headers: {
                    "Authorization": `Bearer ${this.tokenService.getToken()}`
                },
            });

        return await response.json() as PaginatedTracks;
    }
}

interface CreatePlaylistRequest {
    name: string;
    description: string;
    public: boolean;
}

interface AddToPlaylistRequest {
    uris: string[];
}

export interface DepaginatedAlbum extends ApiAlbum {
    // same fields, but tracks are depaginated
}