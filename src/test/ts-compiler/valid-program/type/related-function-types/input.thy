type RelatedTypesType is def "himom"

funcWithRelatedTypes is def
  type T is Given RelatedTypesType
  type U0 is Union T Number
  type U is Given U0
  type return U
  p is given U
  return p
