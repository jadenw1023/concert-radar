-- CreateTable
CREATE TABLE "User" (
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("spotifyId")
);

-- CreateTable
CREATE TABLE "TopArtist" (
    "id" TEXT NOT NULL,
    "spotifyArtistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TopArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concert" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "dateTime" TEXT NOT NULL,
    "ticketUrl" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "Concert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TopArtist" ADD CONSTRAINT "TopArtist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("spotifyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concert" ADD CONSTRAINT "Concert_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "TopArtist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
