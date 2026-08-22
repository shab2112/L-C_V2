import { DriveProject } from '../types';
import { FeaturedProperty, getAllFeaturedProperties } from '../lib/propertyIntelligenceStore';

const buildFactsheet = (property: FeaturedProperty) => {
  const lines = [
    `Project: ${property.title}`,
    `Developer: ${property.developer}`,
    `Location: ${property.location}`,
    `Status: ${property.status}`,
    property.propertyType ? `Property Type: ${property.propertyType}` : '',
    property.beds ? `Bedrooms: ${property.beds}` : '',
    property.baths ? `Bathrooms: ${property.baths}` : '',
    property.area ? `Area: ${property.area} sqft` : '',
    property.price ? `Starting Price: AED ${property.price.toLocaleString('en-AE')}` : 'Starting Price: Ask advisor',
    property.paymentPlan ? `Payment Plan: ${property.paymentPlan}` : '',
    property.completionDate ? `Completion / Handover: ${property.completionDate}` : '',
    property.amenities?.length ? `Amenities: ${property.amenities.join(', ')}` : '',
    property.description ? `Description: ${property.description}` : '',
    property.investmentCase ? `Investment Case: ${property.investmentCase}` : '',
    property.routePath ? `Landing Page: ${property.routePath}` : '',
    property.sourceLabel ? `Source Note: ${property.sourceLabel}` : '',
  ];

  return lines.filter(Boolean).join('\n');
};

const toContentStudioProject = (property: FeaturedProperty): DriveProject => ({
  id: property.id,
  name: property.title,
  developer: property.developer,
  routePath: property.routePath || `/projects/${property.id}`,
  assets: [
    {
      id: `${property.id}-hero`,
      name: `${property.title} hero image`,
      type: 'image',
      url: property.imageUrl,
    },
    {
      id: `${property.id}-factsheet`,
      name: `${property.title} factsheet`,
      type: 'factsheet',
      url: property.routePath || `/projects/${property.id}`,
      content: buildFactsheet(property),
    },
  ].filter(asset => asset.type !== 'image' || Boolean(asset.url)),
});

export const getContentStudioProjects = async (): Promise<Omit<DriveProject, 'assets'>[]> => {
  return getAllFeaturedProperties().map(property => {
    const project = toContentStudioProject(property);
    return {
      id: project.id,
      name: project.name,
      developer: project.developer,
    };
  });
};

export const getContentStudioProjectAssets = async (projectId: string): Promise<DriveProject | undefined> => {
  const property = getAllFeaturedProperties().find(item => item.id === projectId);
  return property ? toContentStudioProject(property) : undefined;
};
