import { type DirPathLikeTypes, FilePath, pathLikeToDirPath } from 'node-lib'

export interface RPCS3PackageFilesManifestData {
	/**
	 * A string with the name and size of all files formatted to create contents hash from it.
	 */
	manifest: string
	/**
	 * The size of all files from the package.
	 */
	packageSize: number
	/**
	 * An array with relative paths of all package files (excluding the song package's DTA file itself).
	 */
	packageFiles: string[]
}

/**
 * Generates a manifest string with name and size of all files from an installed song package.
 * - - - -
 * @param {DirPathLikeTypes} packageDirPath The path to the installed song package to generate the manifest string from.
 * @returns {Promise<RPCS3PackageFilesManifestData>}
 */
export const genRPCS3SongPackageManifest = async (packageDirPath: DirPathLikeTypes): Promise<RPCS3PackageFilesManifestData> => {
	const packagePath = pathLikeToDirPath(packageDirPath)
	const insideSongsFolderPath = packagePath.gotoDir('songs').path
	const files = (await packagePath.gotoDir('songs').readDir(true))
		.filter((entry) => entry instanceof FilePath)
		.map((entry) => entry.path.slice(packagePath.gotoDir('songs').path.length + 1).replace(/\\/g, '/'))
		.toReversed()
		.filter((val) => val.toLowerCase() !== 'songs.dta' && val.toLowerCase() !== 'folder.jpg' && val.toLowerCase() !== 'package.md')
		.map((file) => FilePath.of(insideSongsFolderPath, file))
	let manifest = ''
	let packageSize = 0
	let i = 0

	for (const file of files) {
		const fileStat = await file.stat()
		manifest += `| file=${files[i].path.slice(insideSongsFolderPath.length + 1).replace(/\\/g, '/')} | size=${fileStat.size}\n`
		packageSize += fileStat.size
		i++
	}

	return { manifest, packageSize, packageFiles: files.map((file) => file.path) }
}
