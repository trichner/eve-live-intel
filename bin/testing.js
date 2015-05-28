/**
 * Created by Thomas on 15.04.2015.
 */

var dateString = "2015-05-06T18:06:28.000Z"

console.log("Date:" + new Date(dateString))

console.log("Date:" + new Date(new Date() - dateString.getTime()))