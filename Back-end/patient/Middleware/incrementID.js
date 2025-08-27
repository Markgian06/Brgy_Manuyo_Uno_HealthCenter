import Counter from "../DatabaseModel/counter.js";

export const getNextSequenceValue = async (sequenceName) => {
    const sequenceDocument = await Counter.findOneAndUpdate({
      name: sequenceName
    }, {
      $inc: {
        sequence_value: 1
      }
    }, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });
    
    if (sequenceDocument.sequence_value === 1) {
      await Counter.findOneAndUpdate({ name: sequenceName }, { $set: { sequence_value: 101 } });
      return 101;
    }
    return sequenceDocument.sequence_value;
  };