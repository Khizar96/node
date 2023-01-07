const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
  await User.aggregate([
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "count",
      },
    },
    { 
      $addFields: {postCount: {$size: "$count"}}
    },
    { $facet    : {
      metadata: [ { $count: "total" }, { $addFields: { page: 1 } } ],
      data: [ { $skip: 20 }, { $limit: 10 } ]
  } }
  ]).sort({name: 'asc'}).exec(function(err, postCount) {
    let data = [],totalCount,page;
    let limit =10;
    if(postCount){
      for (let i = 0; i < postCount[0].data.length; i++) {
        let tempObj = {
          _id:  postCount[0].data[i]._id,
          name: postCount[0].data[i].name,
          posts: postCount[0].data[i].postCount
        }
        data.push(tempObj)
      }
    }
    totalCount=postCount[0].metadata[0].total;
    page=postCount[0].metadata[0].page;

    res.send({data : {user:data,pagination: {
        totalDocs: totalCount,
        page: page,
        limit: limit,
        totalPages: totalCount/limit,
        pagingCounter:page,
      }
    }})
  })
  } catch (error) {
    res.send({ error: error.message });
  }
};
