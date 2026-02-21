import { createClient } from '../utils/db'
import { isValidCoords } from '../utils/helpers'
import treeGroupMap from '../utils/treeGroupMap'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  let bbox: number[] = [-90, -180, 90, 180]

  if (query.bbox) {
    bbox = String(query.bbox)
      .split(',')
      .map(x => parseFloat(x.trim()))

    if (
      bbox.length < 4 ||
      !isValidCoords(bbox[0], bbox[1]) ||
      !isValidCoords(bbox[2], bbox[3])
    ) {
      throw createError({ statusCode: 400, message: `Invalid bbox: ${query.bbox}` })
    }
  }

  const client = createClient()
  await client.connect()
  try {
    const result = await client.query({
      name: 'trees',
      text: `SELECT ssm_key, description, img, type
                  , ST_Y(point) AS lat, ST_X(point) AS lon
             FROM trees
             WHERE type != ''
               AND ST_Contains(ST_MakeEnvelope($1, $2, $3, $4), point)`,
      //       lon_min, lat_min, lon_max, lat_max
      values: [bbox[1], bbox[0], bbox[3], bbox[2]],
    })

    return result.rows.map(x => ({
      key: x.ssm_key.trim(),
      lat: x.lat,
      lng: x.lon,
      desc: x.description !== '',
      img: x.img !== '',
      type: x.type.trim(),
      group: treeGroupMap[x.type.trim()] || 'tree',
    }))
  } finally {
    await client.end()
  }
})
