import {Album, LibraryService, LibraryStats} from "./LibraryService";
import {ApiClient} from "./ApiClient";
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {ApiAlbum} from "./model";
import {RandomChoice} from "../RandomChoice";

describe("LibraryService", () => {
    let apiClient: ApiClient;
    let libraryService: LibraryService;
    let randomChoice: RandomChoice;

    beforeEach(() => {
        apiClient = mock(ApiClient);
        randomChoice = mock(RandomChoice);
        libraryService = new LibraryService(instance(apiClient), instance(randomChoice));
    });

    describe("getStats", () => {
        it("returns album and track counts and remaining items", async () => {
            when(apiClient.getAlbumCount()).thenReturn(Promise.resolve(23));
            when(apiClient.getTrackCount()).thenReturn(Promise.resolve(42));

            const stats = await libraryService.getStats();

            expect(stats).toEqual({
                albums: 23,
                tracks: 42,
                remaining: 10000 - 23 - 42
            } as LibraryStats);
        });
    });

    describe("getUsername", () => {
        it("returns the username", async () => {
            when(apiClient.getUsername()).thenReturn(Promise.resolve("username"));

            const username = await libraryService.getUsername();

            expect(username).toEqual("username");
            verify(apiClient.getUsername()).once();
        });
    });

    describe("getRandomAlbum", () => {
        describe("when the album count is not cached", () => {
            const test = async (apiAlbum: ApiAlbum, expectedAlbum: Album) => {
                const totallyRandomNumber = 5;
                when(apiClient.getAlbumCount()).thenReturn(Promise.resolve(23));
                when(randomChoice.randomInt(anything())).thenReturn(totallyRandomNumber);
                when(apiClient.getAlbumByOffset(anything())).thenReturn(Promise.resolve(apiAlbum));

                const album = await libraryService.getRandomAlbum();

                verify(apiClient.getAlbumCount()).once();
                verify(randomChoice.randomInt(23)).once();
                verify(apiClient.getAlbumByOffset(totallyRandomNumber)).once();
                expect(album).toEqual(expectedAlbum);
            };

            it("retrieves album count and a random album", async () => {
                await test(apiAlbum3, expectedAlbum3);
            });

            it("properly formats albums with 1 artist", async () => {
                await test(apiAlbum1, expectedAlbum1);
            });
        });

        describe("when the album count is cached", () => {
            beforeEach(async () => {
                when(apiClient.getAlbumCount()).thenReturn(Promise.resolve(23));
                when(apiClient.getTrackCount()).thenReturn(Promise.resolve(42));
                await libraryService.getStats();
                reset(apiClient);
            });

            it("does not retrieve the count again", async () => {
                const totallyRandomNumber = 5;
                when(randomChoice.randomInt(anything())).thenReturn(totallyRandomNumber);
                when(apiClient.getAlbumByOffset(anything())).thenReturn(Promise.resolve(apiAlbum1));

                const album = await libraryService.getRandomAlbum();

                verify(apiClient.getAlbumCount()).never();
                verify(randomChoice.randomInt(23)).once();
                verify(apiClient.getAlbumByOffset(totallyRandomNumber)).once();
                expect(album).toEqual(expectedAlbum1);
            });
        });

        xit("does not return the same album twice", () => {
            fail();
        });
    });
});

const expectedAlbum3 = {
    name: "album-name",
    artists: "artist-1, artist-2 & artist-3",
    cover: "http://example.com/image-1.jpg",
    id: "album-id"
} as Album;

const apiAlbum3 = {
    id: "album-id",
    name: "album-name",
    artists: [
        {name: "artist-1"},
        {name: "artist-2"},
        {name: "artist-3"},
    ],
    images: [
        {
            width: 320,
            height: 240,
            url: "http://example.com/image-1.jpg",
        },
        {
            width: 1024,
            height: 768,
            url: "http://example.com/image-2.jpg",
        }
    ]
} as ApiAlbum;

const expectedAlbum1 = {
    name: "album-name",
    artists: "artist-1",
    cover: "http://example.com/image-1.jpg",
    id: "album-id"
} as Album;

const apiAlbum1 = {
    id: "album-id",
    name: "album-name",
    artists: [
        {name: "artist-1"},
    ],
    images: [
        {
            width: 320,
            height: 240,
            url: "http://example.com/image-1.jpg",
        },
        {
            width: 1024,
            height: 768,
            url: "http://example.com/image-2.jpg",
        }
    ]
} as ApiAlbum;